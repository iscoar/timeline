import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    layout("layouts/DefaultLayout.tsx", [
        index("routes/home.tsx"),
        route("profile", "routes/profile.tsx"),
    ]),

    // auth layout for login/register pages
    layout("layouts/AuthLayout.tsx", [
        route("login", "routes/login.tsx"),
        route("register", "routes/register.tsx"),
        route("verify", "routes/verify.tsx"),
    ]),
] satisfies RouteConfig;
