<script>
    import { goto } from "$app/navigation";
    import { Button, Modal, ModalBody, Alert, Icon } from "sveltestrap";

    export let data;

    let isOpend = false;
    const toggle = () => (isOpend = !isOpend);

    let alertFlag = data.user;
    const alertToggle = () => (alertFlag = !alertFlag);

    if (data.user) {
        setTimeout(() => {
            alertToggle();
        }, 1000);
    }

    let visible = false;
</script>

<header class="p-3 text-bg-dark">
    <div class="container">
        <div
            class="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start"
        >
            <a
                href="/"
                class="d-flex align-items-center mb-2 mb-lg-0 text-white text-decoration-none"
            >
                <svg
                    class="bi me-2"
                    width="40"
                    height="32"
                    role="img"
                    aria-label="Bootstrap"><use xlink:href="#bootstrap" /></svg
                >
            </a>

            <ul
                class="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0"
            >
                <li>
                    <a href="/main" class="nav-link px-2 text-secondary">홈</a>
                </li>
                <li>
                    <a href="/api" class="nav-link px-2 text-white">자유</a>
                </li>
                <li>
                    <a href="/test/1" class="nav-link px-2 text-white">Q&A</a>
                </li>
                <li>
                    <a href="#" class="nav-link px-2 text-white">커뮤니티</a>
                </li>
                <li><a href="#" class="nav-link px-2 text-white">이벤트</a></li>
            </ul>

            <form class="col-12 col-lg-auto mb-3 mb-lg-0 me-lg-3" role="search">
                <input
                    type="search"
                    class="form-control form-control-dark text-bg-dark"
                    placeholder="검색"
                    aria-label="Search"
                />
            </form>

            {#if data.user}
                <div class="px-4">
                    <strong>
                        <button
                            type="button"
                            class="btn btn-outline-light me-20"
                            >{data.userName}</button
                        >
                    </strong>

                    님 환영합니다
                </div>
                <form action="?/Logout" method="post">
                    <button type="submit" class="btn btn-warning px-2"
                        >로그아웃</button
                    >
                </form>
            {:else}
                <div class="text-end">
                    <button
                        type="button"
                        class="btn btn-outline-light me-2"
                        on:click={() => (isOpend = !isOpend)}>로그인</button
                    >
                    <!-- <button type="button" class="btn btn-warning"
                        >회원가입</button
                    > -->
                </div>
            {/if}
        </div>
    </div>
</header>

<!-- <Button color="primary" on:click={toggle}>Hello World!</Button> -->
<Modal isOpen={isOpend} toggle={() => (isOpend = !isOpend)}>
    <!-- <div class="col-12 col-md-8 col-lg-6 col-xl-5"> -->
    <div class="row card bg-dark text-white" style="border-radius: 1rem;">
        <div class="row card-body p-5 text-center">
            <div class="mb-md-5 mt-md-4 pb-5">
                <form action="?/Login" method="post">
                    <h2 class="fw-bold mb-2 text-uppercase">Login</h2>
                    <p class="text-white-50 mb-5">
                        아이디와 비밀번호를 입력 해 주십시오.
                    </p>

                    <div class="form-outline form-white mb-4">
                        <input
                            type="text"
                            id="typeEmailX"
                            class="form-control form-control-lg"
                            name="id"
                            required
                        />
                        <label class="form-label" for="typeEmailX">아이디</label
                        >
                    </div>

                    <div class="form-outline form-white mb-4">
                        <input
                            type="password"
                            id="typePasswordX"
                            class="form-control form-control-lg"
                            name="password"
                            required
                        />
                        <label class="form-label" for="typePasswordX"
                            >비밀번호</label
                        >
                    </div>

                    <p class="small mb-5 pb-lg-2">
                        <a class="text-white-50" href="#!"
                            >비밀번호를 잊어버리셨습니까?</a
                        >
                    </p>

                    <button
                        class="btn btn-outline-light btn-lg px-5"
                        type="submit">로그인</button
                    >

                    <div
                        class="d-flex justify-content-center text-center mt-4 pt-1"
                    >
                        <a href="#!" class="text-white"
                            ><i class="fab fa-facebook-f fa-lg" /></a
                        >
                        <a href="#!" class="text-white"
                            ><i class="fab fa-twitter fa-lg mx-4 px-2" /></a
                        >
                        <a href="#!" class="text-white"
                            ><i class="fab fa-google fa-lg" /></a
                        >
                    </div>
                </form>
            </div>

            <div>
                <p class="mb-0">
                    회원아 아니십니까? <a
                        href="#!"
                        class="text-white-50 fw-bold">회원가입</a
                    >
                </p>
            </div>
        </div>
    </div>
</Modal>

<Alert color="success" isOpen={alertFlag} {alertToggle}>
    <!-- <Alert color="primary" {isOpen} toggle={() => (isOpen = false)}> -->
    로그인 성공
    <!-- I can be controlled via <code>isOpen</code> and <code>toggle</code>. -->
</Alert>

<!-- <Button color="primary" on:click={() => (alertFlag = !alertFlag)}>test</Button>

<Alert color="primary" isOpen={visible} toggle={() => (visible = false)}>
    I can be controlled via <code>isOpen</code> and <code>toggle</code>.
</Alert>
<Button on:click={() => (visible = !visible)}>You can toggle me here.</Button> -->
