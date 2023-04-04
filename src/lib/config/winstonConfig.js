import winston from 'winston'
import winstonDaily from 'winston-daily-rotate-file'

const { combine, timestamp, printf, colorize, prettyPrint, splat, simple } = winston.format
const logDir = 'logs'

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
}

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue'
}
winston.addColors(colors)

const getLoggingLevel = () => {
    const env = process.env.NODE_ENV || 'development'
    return env === 'development' ? 'debug' : 'http';
}

// Log Format
const logFormat = combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    printf((info) => {
        if (info.stack) {
            return `${info.timestamp} ${info.level}: ${info.message} \n Error Stack: ${info.stack}`
        }
        return `${info.timestamp} ${info.level}: ${info.message}`
    })
)

const replaceStr = msg => msg.replace(/\\n/g, '').replace(/\\t/g, '').replace(/[+'"]/g, '');


// 콘솔에 찍힐 때는 색깔을 구변해서 로깅해주자.
const consoleOpts = {
    handleExceptions: true,
    level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
    format: combine(
        prettyPrint(),
        splat(),
        // simple(),
        printf(
            // info => `${info.timestamp} ${info.filename} [${info.level}]: ${info.message}`
            info => `${info.timestamp} [${info.level}]: ${replaceStr(info.message)}`
        ),
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' })
    )
}

const transports = [
    // 콘솔로그찍을 때만 색넣자.
    new winston.transports.Console(consoleOpts),
    // error 레벨 로그를 저장할 파일 설정
    new winstonDaily({
        level: 'error',
        datePattern: 'YYYY-MM-DD',
        dirname: `${logDir}/error`,
        filename: '%DATE%.error.log',
        maxFiles: 30,
        zippedArchive: true,
        handleExceptions: true
    }),
    // 모든 레벨 로그를 저장할 파일 설정
    new winstonDaily({
        level: 'debug',
        datePattern: 'YYYY-MM-DD',
        dirname: `${logDir}/all`,
        filename: '%DATE%.all.log',
        maxFiles: 30,
        zippedArchive: true,
        handleExceptions: true
    })
]

const logger = winston.createLogger({
    level: getLoggingLevel(),
    levels,
    format: logFormat,
    transports,
})

// module.exports = logger;
export default logger
// export {logger}