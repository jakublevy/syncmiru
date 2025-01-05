import {ReactElement} from "react";
import {useTranslation} from "react-i18next";
import {createLocaleComparator} from "src/utils/sort.ts";

export default function Acknowledgements(): ReactElement {
    const {t} = useTranslation()
    const localeComparator = createLocaleComparator(t)
    const deps: Array<Dep> = [
        // package.json
        {
            name: "@mittwald/react-use-promise",
            url: "https://github.com/mittwald/react-use-promise",
            copyright: "Copyright (c) 2023 Mittwald CM Service GmbH & Co. KG and contributors",
            license: "MIT License"
        },
        {
            name: "@tauri-apps/api",
            url: "https://www.npmjs.com/package/@tauri-apps/api",
            copyright: "Copyright (c) 2017 - Present Tauri Apps Contributors",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "@tauri-apps/plugin-shell",
            url: "https://github.com/tauri-apps/tauri-plugin-shell",
            copyright: "Copyright (c) 2017 - Present Tauri Apps Contributors",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "i18next",
            url: "https://www.i18next.com/",
            copyright: "Copyright (c) 2024 i18next",
            license: "MIT License"
        },
        {
            name: "i18next-http-backend",
            url: "https://github.com/i18next/i18next-http-backend",
            copyright: "Copyright (c) 2024 i18next",
            license: "MIT License"
        },
        {
            name: "react",
            url: "https://react.dev/",
            copyright: "Copyright (c) Meta Platforms, Inc. and affiliates",
            license: "MIT License"
        },
        {
            name: "react-country-flag",
            url: "https://github.com/danalloway/react-country-flag",
            copyright: "Copyright (c) 2021 Dan Alloway",
            license: "MIT License"
        },
        {
            name: "react-dom",
            url: "https://www.npmjs.com/package/react-dom",
            copyright: "Copyright (c) Meta Platforms, Inc. and affiliates",
            license: "MIT License"
        },
        {
            name: "react-error-boundary",
            url: "https://github.com/bvaughn/react-error-boundary",
            copyright: "Copyright (c) 2020 Brian Vaughn",
            license: "MIT License"
        },
        {
            name: "react-i18next",
            url: "https://react.i18next.com/",
            copyright: "Copyright (c) 2024 i18next",
            license: "MIT License"
        },
        {
            name: "wouter",
            url: "https://github.com/molefrog/wouter",
            copyright: "",
            license: "The Unlicense license"
        },
        {
            name: "react-select",
            url: "https://react-select.com",
            copyright: "Copyright (c) 2022 Jed Watson",
            license: "MIT License"
        },
        {
            name: "react-spinners",
            url: "https://github.com/davidhu2000/react-spinners",
            copyright: "Copyright (c) 2017 David Hu",
            license: "MIT License"
        },
        {
            name: "react-tooltip",
            url: "https://github.com/ReactTooltip/react-tooltip",
            copyright: "Copyright (c) 2022 ReactTooltip Team Github",
            license: "MIT License"
        },
        {
            name: "swr",
            url: "https://swr.vercel.app/",
            copyright: "Copyright (c) 2023 Vercel, Inc.",
            license: "MIT License"
        },
        {
            name: "@hcaptcha/react-hcaptcha",
            url: "https://github.com/hCaptcha/react-hcaptcha",
            copyright: "Copyright (c) 2018 hCaptcha",
            license: "MIT License"
        },
        {
            name: "react-hook-form",
            url: "https://react-hook-form.com/",
            copyright: "Copyright (c) 2019-present Beier(Bill) Luo",
            license: "MIT License"
        },
        {
            name: "joi",
            url: "https://github.com/hapijs/joi",
            copyright: "Copyright (c) 2012-2022, Project contributors.\nCopyright (c) 2012-2022, Sideway. Inc.\nCopyright (c) 2012-2014, Walmart. All rights reserved.",
            license: "3-Clause BSD License"
        },
        {
            name: "@hookform/resolvers",
            url: "https://github.com/react-hook-form/resolvers",
            copyright: "Copyright (c) 2019-present Beier(Bill) Luo",
            license: "MIT License"
        },
        {
            name: "react-status-alert",
            url: "https://github.com/daymosik/react-status-alert",
            copyright: "Copyright (c) 2018 Damian Majsner",
            license: "MIT License"
        },
        {
            name: "compare-versions",
            url: "https://github.com/omichelsen/compare-versions",
            copyright: "Copyright (c) 2015-2021 Ole Michelsen",
            license: "MIT License"
        },
        {
            name: "react-resizable-panels",
            url: "https://react-resizable-panels.vercel.app/",
            copyright: "Copyright (c) 2023 Brian Vaughn",
            license: "MIT License"
        },
        {
            name: "socket.io-client",
            url: "https://socket.io/",
            copyright: "Copyright (c) 2014-present Guillermo Rauch and Socket.IO contributors",
            license: "MIT License"
        },
        {
            name: "@headlessui/react",
            url: "https://headlessui.com/",
            copyright: "Copyright (c) 2020 Tailwind Labs",
            license: "MIT License"
        },
        {
            name: "react-avatar-editor",
            url: "https://github.com/mosch/react-avatar-editor",
            copyright: "Copyright (c) 2014-2022 Moritz Schwörer",
            license: "MIT License"
        },
        {
            name: "exifreader",
            url: "https://github.com/mattiasw/ExifReader",
            copyright: "",
            license: "MPL-2.0 License"
        },
        {
            name: "rc-slider",
            url: "https://github.com/react-component/slider",
            copyright: "Copyright (c) 2015-present Alipay.com, https://www.alipay.com/",
            license: "MIT License"
        },
        {
            name: "rc-tooltip",
            url: "https://github.com/react-component/tooltip",
            copyright: "Copyright (c) 2015-present Alipay.com, https://www.alipay.com/",
            license: "MIT License"
        },
        {
            name: "@szhsin/react-menu",
            url: "https://github.com/szhsin/react-menu",
            copyright: "Copyright (c) 2020 Zheng Song",
            license: "MIT License"
        },
        {
            name: "react-data-table-component",
            url: "https://github.com/jbetancur/react-data-table-component",
            copyright: "Copyright 2020 John Betancur",
            license: "Apache 2.0 License"
        },
        {
            name: "decimal.js",
            url: "https://github.com/MikeMcl/decimal.js",
            copyright: "Copyright (c) 2022 Michael Mclaughlin",
            license: "MIT License"
        },
        {
            name: "react-movable",
            url: "https://github.com/tajo/react-movable",
            copyright: "Copyright (c) 2019-present, Vojtech Miksu",
            license: "MIT License"
        },
        {
            name: "@tauri-apps/cli",
            url: "https://www.npmjs.com/package/@tauri-apps/cli",
            copyright: "Copyright (c) 2017 - Present Tauri Apps Contributors",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "@types/react",
            url: "https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react",
            copyright: "",
            license: "MIT license"
        },
        {
            name: "@types/react-dom",
            url: "https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react-dom",
            copyright: "",
            license: "MIT license"
        },
        {
            name: "@types/react-avatar-editor",
            url: "https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react-avatar-editor",
            copyright: "",
            license: "MIT license"
        },{
            name: "@vitejs/plugin-react",
            url: "https://github.com/vitejs/vite-plugin-react",
            copyright: "Copyright (c) 2019-present, Yuxi (Evan) You and Vite contributors",
            license: "MIT License"
        },
        {
            name: "autoprefixer",
            url: "https://github.com/postcss/autoprefixer",
            copyright: "Copyright 2013 Andrey Sitnik <andrey@sitnik.ru>",
            license: "MIT License"
        },
        {
            name: "postcss",
            url: "https://github.com/postcss/postcss",
            copyright: "Copyright 2013 Andrey Sitnik <andrey@sitnik.ru>",
            license: "MIT License"
        },
        {
            name: "tailwindcss",
            url: "https://tailwindcss.com/",
            copyright: "Copyright (c) Tailwind Labs, Inc.",
            license: "MIT License"
        },
        {
            name: "typescript",
            url: "https://www.typescriptlang.org/",
            copyright: "",
            license: "Apache 2.0 License"
        },
        {
            name: "vite",
            url: "https://vitejs.dev/",
            copyright: "Copyright (c) 2019-present, Yuxi (Evan) You and Vite contributors",
            license: "MIT License"
        },
        {
            name: "vite-tsconfig-paths",
            url: "https://github.com/aleclarson/vite-tsconfig-paths",
            copyright: "Copyright (c) Alec Larson",
            license: "MIT License"
        },




        // syncmiru-client
        {
            name: "tauri",
            url: "https://tauri.app/",
            copyright: "Copyright (c) 2017 - Present Tauri Apps Contributors",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "tauri-plugin-shell",
            url: "https://crates.io/crates/tauri-plugin-shell",
            copyright: "Copyright (c) 2017 - Present Tauri Apps Contributors",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "serde",
            url: "https://serde.rs/",
            copyright: "",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "serde_json",
            url: "https://github.com/serde-rs/json",
            copyright: "",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "serde_repr",
            url: "https://github.com/dtolnay/serde-repr",
            copyright: "",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "keyring",
            url: "https://github.com/hwchen/keyring-rs",
            copyright: "Copyright (c) 2016 keyring Developers",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "rust-ini",
            url: "https://github.com/zonyitoo/rust-ini",
            copyright: "Copyright (c) 2014 Y. T. CHUNG",
            license: "MIT License"
        },
        {
            name: "dirs",
            url: "https://github.com/dirs-dev/dirs-rs",
            copyright: "Copyright (c) 2018-2019 dirs-rs contributors",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "sys-locale",
            url: "https://github.com/1Password/sys-locale",
            copyright: "Copyright (c) 2021 1Password",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "thiserror",
            url: "https://github.com/dtolnay/thiserror",
            copyright: "",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "anyhow",
            url: "https://github.com/dtolnay/anyhow",
            copyright: "",
            license: "MIT and Apache 2.0 dual license"
        },{
            name: "tauri-plugin-theme",
            url: "https://github.com/wyhaya/tauri-plugin-theme",
            copyright: "",
            license: "MIT License"
        },
        {
            name: "rust-i18n",
            url: "https://github.com/longbridgeapp/rust-i18n",
            copyright: "Copyright (c) 2021 Longbridge",
            license: "MIT License"
        },
        {
            name: "reqwest",
            url: "https://github.com/seanmonstar/reqwest",
            copyright: "Copyright (c) 2016 Sean McArthur",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "roxmltree",
            url: "https://github.com/RazrFalcon/roxmltree",
            copyright: "Copyright (c) 2018 Yevhenii Reizner",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "tokio",
            url: "https://github.com/tokio-rs/tokio",
            copyright: "Copyright (c) Tokio Contributors",
            license: "MIT License"
        },
        {
            name: "sevenz-rust",
            url: "https://crates.io/crates/sevenz-rust",
            copyright: "",
            license: "Apache License 2.0"
        },
        {
            name: "zip",
            url: "https://github.com/zip-rs/zip2",
            copyright: "Copyright (c) 2014 Mathijs van de Nes",
            license: "MIT License"
        },
        {
            name: "octocrab",
            url: "https://github.com/XAMPPRocky/octocrab",
            copyright: "Copyright (c) 2016 Erin Power",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "serial_test",
            url: "https://github.com/palfrey/serial_test/",
            copyright: "Copyright (c) 2018 Tom Parker-Shemilt",
            license: "MIT License"
        },
        {
            name: "serde_with",
            url: "https://github.com/jonasbb/serde_with",
            copyright: "Copyright (c) 2015",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "machineid-rs",
            url: "https://github.com/Taptiive/machineid-rs",
            copyright: "",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "whoami",
            url: "https://github.com/ardaku/whoami",
            copyright: "",
            license: "MIT or Apache 2.0 or BSL-1.0 license"
        },{
            name: "tauri-plugin-single-instance",
            url: "https://crates.io/crates/tauri-plugin-single-instance",
            copyright: "Copyright (c) 2017 - Present Tauri Apps Contributors",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "sha2",
            url: "https://github.com/RustCrypto/hashes/tree/master/sha2",
            copyright: "Copyright (c) 2006-2009 Graydon Hoare\n" +
                "Copyright (c) 2009-2013 Mozilla Foundation\n" +
                "Copyright (c) 2016 Artyom Pavlov\n" +
                "Copyright (c) 2016-2024 The RustCrypto Project Developers",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "hex",
            url: "https://github.com/KokaKiwi/rust-hex",
            copyright: "Copyright (c) 2013-2014 The Rust Project Developers.\n" +
                "Copyright (c) 2015-2020 The rust-hex Developers",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "cfg-if",
            url: "https://github.com/rust-lang/cfg-if",
            copyright: "Copyright (c) 2014 Alex Crichton",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "interprocess",
            url: "https://github.com/kotauskas/interprocess",
            copyright: "",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "tauri-plugin-dialog",
            url: "https://github.com/tauri-apps/tauri-plugin-dialog",
            copyright: "Copyright (c) 2017 - Present Tauri Apps Contributors",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "rust_decimal",
            url: "https://github.com/paupino/rust-decimal",
            copyright: "Copyright (c) 2016 Paul Mason",
            license: "MIT License"
        },
        {
            name: "rust_decimal_macros",
            url: "https://crates.io/crates/rust_decimal_macros",
            copyright: "Copyright (c) 2016 Paul Mason",
            license: "MIT License"
        },
        {
            name: "once_cell",
            url: "https://github.com/matklad/once_cell",
            copyright: "",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "windows",
            url: "https://github.com/microsoft/windows-rs",
            copyright: "Copyright (c) Microsoft Corporation",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "x11rb",
            url: "https://github.com/psychon/x11rb",
            copyright: "Copyright 2019 x11rb Contributers",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "gtk",
            url: "https://gitlab.gnome.org/GNOME/gtk",
            copyright: "",
            license: "LGPL-2"
        },
        {
            name: "gtk3-rs",
            url: "https://crates.io/crates/gtk",
            copyright: "",
            license: "MIT License"
        },
        {
            name: "gdk3-rs",
            url: "https://crates.io/crates/gdk",
            copyright: "",
            license: "MIT License"
        },
        {
            name: "mpv",
            url: "https://mpv.io/",
            copyright: "",
            license: "GPLv2+"
        },
        {
            name: "yt-dlp",
            url: "https://github.com/yt-dlp/yt-dlp",
            copyright: "",
            license: "The Unlicense license"
        },





        // syncmiru-server
        {
            name: "sqlx",
            url: "https://github.com/launchbadge/sqlx",
            copyright: "Copyright (c) 2020 LaunchBadge, LLC",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "axum",
            url: "https://github.com/tokio-rs/axum",
            copyright: "Copyright (c) 2019 Axum Contributors",
            license: "MIT License"
        },
        {
            name: "tower",
            url: "https://github.com/tower-rs/tower",
            copyright: "Copyright (c) 2019 Tower Contributors",
            license: "MIT License"
        },
        {
            name: "tower-http",
            url: "https://github.com/tower-rs/tower-http",
            copyright: "Copyright (c) 2019-2021 Tower Contributors",
            license: "MIT License"
        },
        {
            name: "socketioxide",
            url: "https://github.com/Totodore/socketioxide",
            copyright: "Copyright (c) 2023 Théodore Prévot",
            license: "MIT License"
        },
        {
            name: "log",
            url: "https://github.com/rust-lang/log",
            copyright: "Copyright (c) 2014 The Rust Project Developers",
            license: "MIT License"
        },
        {
            name: "yaml-rust2",
            url: "https://github.com/Ethiraric/yaml-rust2",
            copyright: "Copyright (c) Chen Yuheng\nCopyright (c) Ethiraric",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "clap",
            url: "https://github.com/clap-rs/clap",
            copyright: "Copyright (c) Individual contributors",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "simplelog",
            url: "https://github.com/drakulix/simplelog.rs",
            copyright: "Copyright (c) 2015 Victor Brekenfeld",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "validator",
            url: "https://github.com/Keats/validator",
            copyright: "Copyright (c) 2016 Vincent Prouillet",
            license: "MIT License"
        },
        {
            name: "hcaptcha",
            url: "https://github.com/jerus-org/hcaptcha-rs",
            copyright: "Copyright (c) 2022 jerusdp",
            license: "MIT and Apache 2.0 dual license"
        },{
            name: "argon2",
            url: "https://github.com/RustCrypto/password-hashes/tree/master/argon2",
            copyright: "Copyright (c) 2021-2024 The RustCrypto Project Developers",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "rand",
            url: "https://github.com/rust-random/rand",
            copyright: "Copyright 2018 Developers of the Rand project\n" +
                "Copyright (c) 2014 The Rust Project Developers",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "base64",
            url: "https://github.com/marshallpierce/rust-base64",
            copyright: "Copyright (c) 2015 Alice Maz",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "lettre",
            url: "https://github.com/lettre/lettre",
            copyright: "Copyright (c) 2014-2024 Alexis Mousset <contact@amousset.me>\n" +
                "Copyright (c) 2019-2024 Paolo Barbolini <paolo@paolo565.org>\n" +
                "Copyright (c) 2018 K. <kayo@illumium.org",
            license: "MIT License"
        },
        {
            name: "serde_urlencoded",
            url: "https://github.com/nox/serde_urlencoded",
            copyright: "Copyright (c) 2016 Anthony Ramine",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "pem",
            url: "https://github.com/jcreekmore/pem-rs",
            copyright: "Copyright (c) 2016 Jonathan Creekmore",
            license: "MIT License"
        },
        {
            name: "josekit",
            url: "https://github.com/hidekatsu-izuno/josekit-rs",
            copyright: "",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "openssl",
            url: "https://github.com/openssl/openssl",
            copyright: "Copyright (c) 1998-2024 The OpenSSL Project Authors\n" + "Copyright (c) 1995-1998 Eric A. Young, Tim J. Hudson\n" + "All rights reserved.",
            license: "Apache 2.0 License"
        },
        {
            name: "rust-openssl",
            url: "https://github.com/sfackler/rust-openssl",
            copyright: "",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "bimap",
            url: "https://github.com/billyrieger/bimap-rs/",
            copyright: "",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "chrono",
            url: "https://github.com/chronotope/chrono",
            copyright: "Copyright (c) 2014--2017, Kang Seonghoon and\n" +
                "contributors",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "image",
            url: "https://github.com/image-rs/image",
            copyright: "",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "urlencoding",
            url: "https://github.com/kornelski/rust_urlencoding",
            copyright: "Copyright © 2016 Bertram Truong\n" +
                "Copyright © 2021 Kornel Lesiński",
            license: "MIT License"
        },{
            name: "indexmap",
            url: "https://github.com/indexmap-rs/indexmap",
            copyright: "Copyright (c) 2016--2017",
            license: "MIT and Apache 2.0 dual license"
        },
        {
            name: "url",
            url: "https://github.com/servo/rust-url",
            copyright: "Copyright (c) 2013-2022 The rust-url developers",
            license: "MIT and Apache 2.0 dual license"
        },





        // svg
        {
            name: "Speech Bubble 12 SVG Vector",
            url: "https://www.svgrepo.com/svg/478728/speech-bubble-12",
            copyright: "Author: Icooon Mono",
            license: "Public Domain"
        },
        {
            name: "Check Mark SVG Vector",
            url: "https://www.svgrepo.com/svg/404945/check-mark",
            copyright: "Author: Twitter",
            license: "MIT License"
        },
        {
            name: "Close Circle SVG Vector",
            url: "https://www.svgrepo.com/svg/423627/close-circle",
            copyright: "Author: Radhika Paghdal",
            license: "CC Attribution License 4.0"
        },
        {
            name: "Collapse Right SVG Vector",
            url: "https://www.svgrepo.com/svg/379887/collapse-right",
            copyright: "Author: zwicon",
            license: "CC Attribution License 4.0"
        },
        {
            name: "Copy SVG Vector",
            url: "https://www.svgrepo.com/svg/500824/copy",
            copyright: "Author: kudakurage",
            license: "OFL License"
        },
        {
            name: "Cross SVG Vector",
            url: "https://www.svgrepo.com/svg/520676/cross",
            copyright: "Author: Ankush Syal",
            license: "CC Attribution License 4.0"
        },
        {
            name: "Warning SVG Vector",
            url: "https://www.svgrepo.com/svg/489221/warning",
            copyright: "Author: Gabriele Malaspina",
            license: "Public Domain"
        },
        {
            name: "Dark Mode Night Moon SVG Vector",
            url: "https://www.svgrepo.com/svg/381213/dark-mode-night-moon",
            copyright: "Author: nickylimyeanfen",
            license: "CC Attribution License 4.0"
        },
        {
            name: "User Avatar Filled SVG Vector",
            url: "https://www.svgrepo.com/svg/341256/user-avatar-filled",
            copyright: "Author: Carbon Design",
            license: "Apache License 2.0"
        },
        {
            name: "Delete 1487 SVG Vector",
            url: "https://www.svgrepo.com/svg/511788/delete-1487",
            copyright: "Author: bypeople",
            license: "Public Domain"
        },
        {
            name: "Eject Icon",
            url: "https://www.onlinewebfonts.com/icon/141671",
            copyright: "",
            license: "CC Attribution License 4.0"
        },
        {
            name: "Session Leave SVG Vector",
            url: "https://www.svgrepo.com/svg/304503/session-leave",
            copyright: "Author: Significa Labs",
            license: "Public Domain"
        },
        {
            name: "Edit SVG Vector",
            url: "https://www.svgrepo.com/svg/513824/edit",
            copyright: "Author: Vaneet Thakur",
            license: "CC Attribution License 4.0"
        },
        {
            name: "Exclamation Mark SVG Vector",
            url: "https://www.svgrepo.com/svg/403243/exclamation-mark",
            copyright: "Author: joypixels",
            license: "MIT License"
        },
        {
            name: "Expand Left SVG Vector",
            url: "https://www.svgrepo.com/svg/379379/expand-left",
            copyright: "Author: zwicon",
            license: "CC Attribution License 4.0"
        },
        {
            name: "Directory Image 1627 SVG Vector",
            url: "https://www.svgrepo.com/svg/511832/directory-image-1627",
            copyright: "Author: bypeople",
            license: "Public Domain"
        },
        {
            name: "Hourglass SVG Vector 328",
            url: "https://www.svgrepo.com/svg/525949/hourglass",
            copyright: "Author: Solar Icons",
            license: "CC Attribution License 4.0"
        },
        {
            name: "Left Right Arrow 2 SVG Vector",
            url: "https://www.svgrepo.com/svg/469166/left-right-arrow-2",
            copyright: "Author: Mary Akveo",
            license: "Public Domain"
        },
        {
            name: "Light Mode SVG Vector",
            url: "https://www.svgrepo.com/svg/432507/light-mode",
            copyright: "Author: Sargam Icons",
            license: "MIT License"
        },
        {
            name: "Link Round 1110 SVG Vector",
            url: "https://www.svgrepo.com/svg/512415/link-round-1110",
            copyright: "Author: bypeople",
            license: "Public Domain"
        },
        {
            name: "Mpv Android SVG Vector",
            url: "https://www.svgrepo.com/svg/504625/mpv-android",
            copyright: "Author: lawnchairlauncher",
            license: "Apache License 2.0"
        },
        {
            name: "Folder Parent SVG Vector",
            url: "https://www.svgrepo.com/svg/340341/folder-parent",
            copyright: "Author: Carbon Design",
            license: "Apache License 2.0"
        },
        {
            name: "Party Popper",
            url: "https://iconduck.com/emojis/36209/party-popper",
            copyright: "",
            license: "Apache License 2.0"
        },
        {
            name: "Pc Display 2 SVG Vector",
            url: "https://www.svgrepo.com/svg/478552/pc-display-2",
            copyright: "Author: Icooon Mono",
            license: "Public Domain"
        },
        {
            name: "Picture SVG Vector",
            url: "https://www.svgrepo.com/svg/488322/picture",
            copyright: "Author: Neuicons",
            license: "MIT License"
        },
        {
            name: "Play SVG Vector",
            url: "https://www.svgrepo.com/svg/522226/play",
            copyright: "Author: Catalin Fertu",
            license: "CC Attribution License 4.0"
        },
        {
            name: "Plus Circle SVG Vector",
            url: "https://www.svgrepo.com/svg/522231/plus-circle",
            copyright: "Author: Catalin Fertu",
            license: "CC Attribution License 4.0"
        },
        {
            name: "Left Circle 2 SVG Vector",
            url: "https://www.svgrepo.com/svg/459465/left-circle-2",
            copyright: "Author: iconhub",
            license: "CC Attribution License 4.0"
        },{
            name: "Question Filled SVG Vector",
            url: "https://www.svgrepo.com/svg/500665/question-filled",
            copyright: "Author: element-plus",
            license: "MIT License"
        },
        {
            name: "Reload SVG Vector",
            url: "https://www.svgrepo.com/svg/446804/reload",
            copyright: "Author: Mehdi Namvar",
            license: "MIT License"
        },
        {
            name: "Resize Vertical SVG Vector",
            url: "https://www.svgrepo.com/svg/391673/resize-vertical",
            copyright: "Author: elusiveicons",
            license: "MIT License"
        },
        {
            name: "Search SVG Vector",
            url: "https://www.svgrepo.com/svg/532555/search",
            copyright: "Author: Dazzle UI",
            license: "CC Attribution License 4.0"
        },
        {
            name: "Server SVG Vector",
            url: "https://www.svgrepo.com/svg/513604/server",
            copyright: "Author: prmack",
            license: "CC Attribution License 4.0"
        },
        {
            name: "Settings SVG Vector",
            url: "https://www.svgrepo.com/svg/501352/settings",
            copyright: "Author: instructure-ui",
            license: "MIT License"
        },{
            name: "Signal SVG Vector",
            url: "https://www.svgrepo.com/svg/487791/signal",
            copyright: "Author: Neuicons",
            license: "MIT License"
        },
        {
            name: "Srt File Format Symbol SVG Vector",
            url: "https://www.svgrepo.com/svg/17893/srt-file-format-symbol",
            copyright: "",
            license: "Public domain"
        },
        {
            name: "Subtitles SVG Vector",
            url: "https://www.svgrepo.com/svg/446039/subtitles",
            copyright: "Author: Denali Design",
            license: "MIT License"
        },
        {
            name: "Synchronize SVG Vector",
            url: "https://www.svgrepo.com/svg/423717/synchronize",
            copyright: "Author: Radhika Paghdal",
            license: "CC Attribution License 4.0"
        },
        {
            name: "Upload SVG Vector",
            url: "https://www.svgrepo.com/svg/522322/upload",
            copyright: "Author: Catalin Fertu",
            license: "CC Attribution License 4.0"
        },{
            name: "Upload Cloud SVG Vector",
            url: "https://www.svgrepo.com/svg/510302/upload",
            copyright: "Author: zest",
            license: "MIT License"
        },
        {
            name: "Video File SVG Vector",
            url: "https://www.svgrepo.com/svg/256839/video-file",
            copyright: "",
            license: "Public Domain"
        },
        {
            name: "View Eye SVG Vector",
            url: "https://www.svgrepo.com/svg/506777/view-eye",
            copyright: "Author: Salah Elimam",
            license: "Public Domain"
        },
        {
            name: "Tools SVG Vector",
            url: "https://www.svgrepo.com/svg/522317/tools",
            copyright: "Author: Catalin Fertu",
            license: "CC Attribution License 4.0"
        },
        {
            name: "Zoom Reset SVG Vector",
            url: "https://www.svgrepo.com/svg/342945/zoom-reset",
            copyright: "Author: CoreyGinnivan",
            license: "Public Domain"
        }

    ]

    return (
        <div className="flex flex-col">
            <div className="flex items-center m-8">
                <h1 className="text-2xl font-bold">{t('license-acknowledgements-title')}</h1>
            </div>
            <div className="flex flex-col ml-8 mr-8 mb-4 gap-y-6">
                <p>{t('license-acknowledgements-text')}</p>
                <pre className="border text-sm w-full h-[calc(100dvh-14.9rem)] overflow-y-auto p-1.5">
                    {deps.sort((d1, d2) => localeComparator(d1.name, d2.name)).map((d, i) => {
                        return (
                            <p key={i}>
                                <b>{d.name}</b>&#10;{d.url}&#10;{d.copyright}{d.copyright !== '' && <>&#10;</>}{d.license}
                                {i + 1 < deps.length && <>&#10;&#10;</>}
                            </p>
                        )
                    })}
                </pre>
            </div>
        </div>
    )
}

interface Dep {
    name: string,
    url: string,
    copyright: string,
    license: string
}