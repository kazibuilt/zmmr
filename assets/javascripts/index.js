async function createApplication(e, t={}, a) {
    const [o, n] = await Promise.all([loadStyles(`/assets/stylesheets/${e}/bundle.css`), import(a || `/assets/javascripts/${e}/bundle.js`).then((e => e.default(t))).catch((t => {
        console.error("failed to create application", e, t)
    }))]);
    return function() {
        n && n(),
        o && o()
    }
}
function createDestroy(e, t, a="router:will-change-url") {
    let o;
    async function n() {
        o = await t()
    }
    function i(t) {
        const a = t?.detail?.url || location.pathname;
        e.test(a) && setTimeout(n, 0)
    }
    document.addEventListener("DOMContentLoaded", i),
    window.addEventListener("router:did-update-content", i),
    window.addEventListener(a, (function() {
        o && (o(), o = void 0)
    }))
}
function loadStyles(e) {
    function t() {}
    return new Promise((a => {
        if (document.querySelector(`link[href="${e}"]`))
            return void a(t);
        const o = document.createElement("link");
        o.onload = function() {
            a(t)
        },
        o.rel = "stylesheet",
        o.href = e,
        document.querySelector("head").appendChild(o)
    }))
}
function createInfiniteSlideshow(e) {
    e.dataset.init = !0;
    let t,
        a,
        o = e.querySelector(".infinite-slideshow-spacer"),
        n = Array.from(o.children),
        i = !1,
        r = n[0].clientWidth,
        s = n[0].clientHeight,
        c = 0,
        l = [],
        d = -1;
    function u(t) {
        c = t;
        let a = c % n.length;
        n.forEach(((e, t) => {
            e.classList.toggle("current", t === a)
        })),
        d !== a && e.dispatchEvent(new CustomEvent("change", {
            detail: {
                index: a
            }
        })),
        d = a
    }
    function m() {
        l.forEach((e => {
            e.parentElement && e.parentElement.removeChild(e)
        }));
        const e = Math.floor(o.clientWidth / r);
        !0 === Number.isFinite(e) && (l = Array(e).fill(void 0).map(((e, t) => {
            const a = document.createElement("div");
            return a.className = "infinite-slideshow-snapper", a.style.left = t * r + "px", o.appendChild(a), a
        })))
    }
    function h(t) {
        e.style.scrollSnapType = t ? null : "none"
    }
    function p() {
        f(),
        u(Math.floor(o.clientWidth / r / 2 / n.length) * n.length + c % n.length),
        e.removeEventListener("scroll", y),
        h(!1);
        const t = .5 * (e.clientWidth - r);
        e.scrollLeft = c * r - (e.clientWidth - r) + t,
        f(),
        h(!0),
        e.addEventListener("scroll", y)
    }
    function f() {
        const t = Math.floor(e.scrollLeft / r),
            a = t + Math.ceil(e.clientWidth / r),
            o = e.getBoundingClientRect(),
            i = Math.round(.5 * (o.height - s));
        for (let e = t; e <= a; e++) {
            const t = n[e % n.length];
            if (void 0 === t)
                continue;
            const a = e * r;
            t.style.transform = `translate3d(${a}px, ${i}px, 0)`;
            const s = t.getBoundingClientRect(),
                c = s.x - o.x + .5 * s.width;
            Math.abs(.5 * o.width - c) < .5 * r && u(e)
        }
    }
    function y() {
        i || (clearTimeout(t), t = setTimeout(p, 300), f())
    }
    m(),
    p(),
    e.addEventListener("jump", (function(a) {
        e.scrollTo({
            left: (c + a.detail.direction) * r - .5 * (e.clientWidth - r),
            behavior: "smooth"
        }),
        clearTimeout(t),
        t = setTimeout(p, 600)
    })),
    window.addEventListener("resize", (function() {
        h(!1),
        clearTimeout(t),
        clearTimeout(a),
        a = setTimeout((() => {
            i = !1,
            h(!0)
        }), 100),
        i = !0,
        r = n[0].clientWidth,
        s = n[0].clientHeight,
        e.scrollLeft = c * r - .5 * (e.clientWidth - r),
        f(),
        m()
    }))
}
(() => {
    const e = [],
        t = {};
    window.experimentValueFor = function(e, a) {
        return t[e].data[a]
    },
    e.forEach((e => {
        try {
            const a = "experiment_" + e.name,
                o = localStorage.getItem(a) || e.variants[Math.trunc(Math.random() * e.variants.length)].name;
            localStorage.setItem(a, o),
            t[e.name] = e.variants.find((({name: e}) => e === o))
        } catch (e) {
            return
        }
        gtag("event", `${key}_${variantName}`),
        gtag("event", "experiment", {
            name: key,
            variant: variantName
        })
    }))
})(),
window.API = {
    BASE_URL: "https://mailer.samara.com/api",
    fetch: (e, t={}) => window.API.shouldFailNext ? (window.API.shouldFailNext = !1, new Promise(((e, t) => {
        setTimeout(t, 1e3, new Error("forced rejection"))
    }))) : fetch(window.API.BASE_URL + e, {
        headers: {
            "Content-Type": "application/json"
        },
        ...t
    }),
    completeAddress(e, t, a, o) {
        let n = `/address?query=${e}`;
        return t && (n += `&session=${t}`), a && (n += `&bias=${a}`), window.API.fetch(n, {
            signal: o
        })
    },
    subscribe: (e, t) => window.API.fetch("/subscribe", {
        method: "POST",
        body: JSON.stringify({
            email: e,
            tags: t
        })
    }),
    contact: e => window.API.fetch("/contact", {
        method: "POST",
        body: e
    }),
    requestShowroomTour: e => window.API.fetch("/contact/showroom", {
        method: "POST",
        body: e
    }),
    requestEstimate: e => window.API.fetch("/contact/estimate", {
        method: "POST",
        body: e
    }),
    orderBegin: () => window.API.fetch("/order/create"),
    orderFetchBySessionId: e => window.API.fetch(`/order/${e}`),
    orderUpdate: (e, t) => window.API.fetch(`/order/${e}`, {
        method: "PUT",
        body: t
    }),
    orderUpdateUsage: (e, t) => window.API.fetch(`/order/${e}/usage`, {
        method: "PUT",
        body: JSON.stringify(t)
    }),
    orderComplete: (e, t) => window.API.fetch(`/order/${e}`, {
        method: "POST",
        body: t
    }),
    expand: (e, t, a, o, n, i) => window.API.fetch("/expand", {
        method: "POST",
        body: JSON.stringify({
            zip: e,
            email: t,
            wantsSeptic: a,
            origin: o,
            sessionId: n,
            address: i
        })
    }),
    appointmentSlots(e, t, a) {
        let o = `/appointment/${e}?date=${t.toISOString()}`;
        return a && (o += `&zip=${a}`), window.API.fetch(o)
    },
    bookAppointment: (e, t, a) => window.API.fetch(`/appointment/${e}`, {
        method: "POST",
        body: JSON.stringify({
            ...a,
            date: t
        })
    }),
    bookHelloCall: (e, t) => window.API.fetch("/appointment/hello", {
        method: "POST",
        body: JSON.stringify({
            date: e,
            slug: t
        })
    }),
    bookEvent: e => window.API.fetch("/appointment/event", {
        method: "POST",
        body: JSON.stringify(e)
    }),
    multiUnitGetInTouch: e => window.API.fetch("/contact/multiunit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(e)
    }),
    estimationRequestFetchBySlug: e => window.API.fetch(`/hello/${e}`, {
        headers: {
            "Content-Type": "application/json"
        }
    })
},
window.addEventListener("mousedown", (e => {
    e.altKey && (window.API.shouldFailNext = !0)
})),
window.process = {
    ...window.process
},
window.process.env = {
    ...window.process.env,
    NODE_ENV: "production"
},
/* (() => {
    const e = document.getElementById("sentry-script");
    e && (e.onload = () => {
        const e = {
            dsn: "https://6239eb46ed1b0d72b5c7186827b1f830@o1233526.ingest.sentry.io/4505953549287424"
        };
        Sentry.init(e),
        window.console.error = function(e) {
            const t = e instanceof Error ? e : new Error(Array.from(arguments).join(" — "));
            Sentry.captureException(t)
        }
    })
})(), */
createDestroy(/.*/, (function() {
    const e = document.querySelector(".footer-nav");
    if (!e || e.dataset.enabled)
        return function() {};
    e.dataset.enabled = !0;
    const t = document.querySelector(".footer-contact-subscription");
    return t.querySelector("input[type=email]").addEventListener("focus", (function() {
        t.classList.remove("footer-contact-subscription-failure", "footer-contact-subscription-success", "footer-contact-subscription-loading")
    })), t.querySelector("form").addEventListener("submit", (async function(a) {
        a.preventDefault();
        const o = t.querySelector("input[type=email]");
        o.blur(),
        await async function(e) {
            t.classList.add("footer-contact-subscription-loading"),
            gtag("event", "footer_subscribe");
            try {
                await API.subscribe(e, ["footer"]),
                t.classList.add("footer-contact-subscription-success")
            } catch (e) {
                t.classList.add("footer-contact-subscription-failure"),
                "undefined" != typeof Sentry && Sentry.captureException(e)
            }
            t.classList.remove("footer-contact-subscription-loading")
        }(o.value),
        t.querySelector("input[type=email]").value = "",
        e.querySelector("form").reset()
    })), function() {}
})),
createDestroy(/.*/, (function() {
    return document.body.querySelectorAll(".infinite-slideshow").forEach((e => {
        void 0 === e.dataset.init && createInfiniteSlideshow(e)
    })), function() {}
})),
createDestroy(/.*/, (function() {
    return document.body.querySelectorAll(".modern-slideshow").forEach((e => {
        void 0 === e.dataset.init && function(e) {
            function t(t) {
                const a = e.getBoundingClientRect(),
                    o = a.left + .5 * a.width,
                    n = Array.from(e.children),
                    i = n.findIndex((e => {
                        const t = e.getBoundingClientRect(),
                            a = t.left + .5 * t.width;
                        return Math.abs(o - a) < .5 * t.width
                    })),
                    r = n[Math.min(Math.max(i + t, 0), n.length - 1)].getBoundingClientRect(),
                    s = r.left + .5 * r.width;
                e.scrollTo({
                    top: 0,
                    left: e.scrollLeft + (s - o),
                    behavior: "smooth"
                })
            }
            e.dataset.init = !0,
            setTimeout((() => {
                e.scrollTo(0, 0)
            }), 40),
            e.addEventListener("click", (function(a) {
                window.innerWidth < 768 || t(a.clientX / e.clientWidth < .5 ? -1 : 1)
            }))
        }(e)
    })), function() {}
})),
document.addEventListener("DOMContentLoaded", (function() {
    const e = document.querySelector("nav.main-navigation"),
        t = e.querySelectorAll("a");
    function a(a) {
        const o = "/" === a.detail.url ? "/backyard" : a.detail.url;
        t.forEach((e => {
            const t = e.getAttribute("href").split("/").length > 2,
                a = e.getAttribute("href") === o || t && o.startsWith(e.getAttribute("href"));
            e.classList.toggle("current", a)
        })),
        e.classList.toggle("transition-configurator", o.startsWith("/backyard/configure")),
        setTimeout((() => {
            e.classList.add("collapsed")
        }), 400)
    }
    e.querySelector(".backyard-configure").hidden = !1,
    window.addEventListener("router:will-change-url", a),
    window.addEventListener("router:scroll-top", (function() {
        e.classList.add("collapsed")
    }));
    const o = e.querySelector(".toggle");
    function n() {
        window.dispatchEvent(new Event("navigation:hover"))
    }
    function i() {
        window.dispatchEvent(new Event("navigation:unhover"))
    }
    o && o.addEventListener("click", (function() {
        e.classList.toggle("collapsed")
    })),
    Array.from(e.children).forEach((e => {
        e.addEventListener("mouseenter", n),
        e.addEventListener("mouseleave", i)
    })),
    a({
        detail: {
            url: location.pathname
        }
    }),
    e.addEventListener("touchmove", (function(e) {
        e.preventDefault()
    }))
})),
createDestroy(/.*/, (function() {
    return document.body.querySelectorAll(".paging-indicator").forEach((e => {
        void 0 === e.dataset.init && function(e) {
            e.dataset.init = !0;
            const t = e.querySelectorAll("li");
            if (e.dataset.changeEmmiterSelector && document.querySelector(e.dataset.changeEmmiterSelector).addEventListener("change", (function(e) {
                t.forEach(((t, a) => {
                    t.classList.toggle("paging-indicator-current", a === e.detail.index)
                }))
            })), e.dataset.scrollElementSelector) {
                let a;
                document.querySelector(e.dataset.scrollElementSelector).addEventListener("scroll", (function(e) {
                    const o = Math.round(e.target.scrollLeft / e.target.scrollWidth * t.length);
                    a !== o && (a = o, t.forEach(((e, t) => {
                        e.classList.toggle("paging-indicator-current", t === o)
                    })))
                }))
            }
        }(e)
    })), function() {}
})),
"undefined" != typeof Element && (Element.prototype.matches || (Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector), Element.prototype.closest || (Element.prototype.closest = function(e) {
    var t = this;
    do {
        if (t.matches(e))
            return t;
        t = t.parentElement || t.parentNode
    } while (null !== t && 1 === t.nodeType);
    return null
})),
document.addEventListener("DOMContentLoaded", (function() {
    const e = {
            "/": {
                title: "Samara",
                description: "Discover Samara's Backyard accessory dwelling units. Elevated design, expertly crafted. Fast and easy installation. Solar-powered and future-ready.",
                class_names: "backyard",
                theme_color: "#000000",
                navigation_inverted: !1,
                position: 1,
                partial_name: "partials/pages/backyard/backyard",
                share_sheet_image_id: "fa1c5758-e587-4b4b-e3f1-a625a73b4500"
            },
            "/showrooms/thousand-oaks/visit": {
                title: "Schedule Your Showroom Visit – Samara",
                description: "",
                class_names: "",
                theme_color: "#000000",
                navigation_inverted: !1,
                position: 0,
                partial_name: "partials/pages/showroom/visit",
                share_sheet_image_id: null
            },
            "/backyard": {
                title: "Backyard – Samara",
                description: "Discover Samara's Backyard accessory dwelling units. Elevated design, expertly crafted. Fast and easy installation. Solar-powered and future-ready.",
                class_names: "backyard",
                theme_color: "#000000",
                navigation_inverted: !1,
                position: 0,
                partial_name: "partials/pages/backyard/backyard",
                share_sheet_image_id: "43d12c31-d3f4-49aa-be9b-511972d1bc00"
            },
            "/backyard/how-it-works": {
                title: "Backyard – How It Works – Samara",
                description: "Learn how easy it is to install an accessory dwelling unit from Samara. From configuration to completion in as few as seven months.",
                class_names: "backyard how-it-works",
                theme_color: "#000000",
                navigation_inverted: !1,
                position: -1,
                partial_name: "partials/pages/backyard/how-it-works",
                share_sheet_image_id: "26440ce7-ba39-472d-0fec-c1d99823a500"
            },
            "/backyard/tech-specs": {
                title: "Backyard – Technical Specifications – Samara",
                description: "See floor plans, technical specifications, and what's included in Backyard studio, one bedroom, and two bedroom models.",
                class_names: "backyard tech-specs",
                theme_color: "#000000",
                navigation_inverted: !1,
                position: -2,
                partial_name: "partials/pages/backyard/tech-specs",
                share_sheet_image_id: "0499c9a9-7a5c-484a-7d7f-6892ddb2d400"
            },
            "/backyard/faq": {
                title: "Backyard – Frequently Asked Questions – Samara",
                description: "Find answers to the most asked questions about Backyard: building regulations, financial planning, construction, and more.",
                class_names: "backyard faq",
                theme_color: "#000000",
                navigation_inverted: !1,
                position: -3,
                partial_name: "partials/pages/backyard/faq",
                share_sheet_image_id: "525b3d2c-6270-4ef5-d824-ecd2f4edd000"
            },
            "/backyard/configure": {
                title: "Customize Backyard – Samara",
                description: "Customize and get a quote for Samara's Backyard accessory dwelling unit. Elevated design, expertly crafted. Fast and easy installation. Solar-powered and future-ready.",
                class_names: "backyard configurator",
                theme_color: "#000000",
                navigation_inverted: !1,
                position: -4,
                partial_name: "partials/pages/backyard/configure",
                share_sheet_image_id: "a02d2050-630d-403d-d386-ccb3506c2300"
            },
            "/news": {
                title: "News – Samara",
                description: "Read the latest news about Samara.",
                class_names: "newsroom",
                theme_color: "#000000",
                navigation_inverted: !1,
                position: -6,
                partial_name: "partials/pages/newsroom/newsroom",
                share_sheet_image_id: "7fd49401-f728-4c12-0229-3fe7abf62900"
            },
            "/jobs": {
                title: "Jobs – Samara",
                description: "Join Samara to help create new ways of living that help people dream bigger.",
                class_names: "jobs",
                theme_color: "#000000",
                navigation_inverted: !1,
                position: -9,
                partial_name: "partials/pages/jobs/jobs",
                share_sheet_image_id: "69bca2cb-e628-48ad-c8fc-ebd743b2c700"
            },
            "/showrooms/redwood-city": {
                title: "Redwood City Showroom – Samara",
                description: "Tour Backyard in person at Samara Redwood City. Find our hours and learn how to book a private tour.",
                class_names: "backyard showroom tour",
                theme_color: "#000000",
                navigation_inverted: !1,
                position: -10,
                partial_name: "partials/pages/showroom/redwood-city",
                share_sheet_image_id: "8e379157-712c-4bea-a50a-38c36767db00"
            },
            "/showrooms": {
                title: "Showrooms – Samara",
                description: "Tour Backyard in person at an our San Francisco Bay Area and Los Angeles showrooms. Learn more about our locations and book a private tour.",
                class_names: "backyard showroom",
                theme_color: "#000000",
                navigation_inverted: !1,
                position: -10,
                partial_name: "partials/pages/showroom/showroom",
                share_sheet_image_id: "7f28da8b-6ec2-423a-f3a8-8a5e7ffa4500"
            },
            "/showrooms/redwood-city/visit": {
                title: "Schedule Your Showroom Visit – Samara",
                description: "Tour Backyard in person at Samara Redwood City. Find our hours and learn how to book a private tour.",
                class_names: "backyard showroom tour",
                theme_color: "#000000",
                navigation_inverted: !1,
                position: -11,
                partial_name: "partials/pages/showroom/visit",
                share_sheet_image_id: "6b07701e-267e-4d6f-b0ea-a32fd8c27a00"
            },
            "/showrooms/thousand-oaks": {
                title: "Thousand Oaks Pop-up Showroom – Samara",
                description: "Tour Backyard in person at Samara Thousand Oaks. Find our hours and learn how to book a private tour.",
                class_names: "backyard showroom tour",
                theme_color: "#000000",
                navigation_inverted: !1,
                position: -12,
                partial_name: "partials/pages/showroom/thousand-oaks",
                share_sheet_image_id: "00cc326f-f637-4227-f98d-dff49167c900"
            },
            "/developers": {
                title: "Samara for Developers",
                description: "Unlock the potential of your parcel with Backyard Multiunit.",
                class_names: "multiunit",
                theme_color: "#000000",
                navigation_inverted: !1,
                position: -13,
                partial_name: "partials/pages/multiunit",
                share_sheet_image_id: "a6119568-ae31-44e7-e7a6-ad201ad8a500"
            },
            "/yoshino": {
                title: "Yoshino – Samara",
                description: null,
                class_names: "yoshino",
                theme_color: "#000000",
                navigation_inverted: !1,
                position: -14,
                partial_name: "partials/pages/yoshino",
                share_sheet_image_id: null
            },
            "/terms-of-service": {
                title: "Terms of Service – Samara",
                description: "",
                class_names: "legal",
                theme_color: "#000000",
                navigation_inverted: !1,
                position: -15,
                partial_name: "partials/pages/terms-of-service",
                share_sheet_image_id: "834edb4b-cd31-423c-4ed3-1accf2066200"
            },
            "/privacy-policy": {
                title: "Privacy Policy – Samara",
                description: null,
                class_names: "legal",
                theme_color: "#000000",
                navigation_inverted: !1,
                position: -16,
                partial_name: "partials/pages/privacy-policy",
                share_sheet_image_id: "94f4f098-aa84-4d11-1b87-65836380a800"
            },
            "/jobs/sales-operations-manager": {
                title: "Sales Operations Manager – Jobs – Samara",
                description: "Join Samara to help create new ways of living that help people dream bigger.",
                class_names: "jobs job",
                theme_color: "#000000",
                navigation_inverted: !1,
                partial_name: "partials/pages/jobs/job",
                position: -9
            },
            "/jobs/sales-account-executive": {
                title: "Sales Account Executive (Project Specialist) – Jobs – Samara",
                description: "Join Samara to help create new ways of living that help people dream bigger.",
                class_names: "jobs job",
                theme_color: "#000000",
                navigation_inverted: !1,
                partial_name: "partials/pages/jobs/job",
                position: -10
            },
            "/jobs/supply-chain-director": {
                title: "Supply Chain Director – Jobs – Samara",
                description: "Join Samara to create new ways of living that help people dream bigger.",
                class_names: "jobs job",
                theme_color: "#000000",
                navigation_inverted: !1,
                partial_name: "partials/pages/jobs/job",
                position: -11
            },
            "/showrooms/events/watsonville-crane-in-event": {
                title: "Watsonville Crane-in Event — Showrooms",
                description: "We’d love to see you at our crane-in event in Watsonville!\r\n\r\n- Watch Samara’s Backyard ADU get installed in minutes\r\n- Enjoy music, coffee, and other refreshments\r\n- Meet the Samara team and get a free site assessment\r\n\r\nPlease RSVP for the complete address and day-of schedule.\r\n",
                class_names: "backyard showroom event",
                theme_color: "#000000",
                navigation_inverted: !1,
                partial_name: "partials/pages/showroom/event",
                position: -20
            },
            "/showrooms/events/webinar-introducing-samaras-real-estate-partner-program": {
                title: "Webinar: Introducing Samara's Real Estate Partner Program — Showrooms",
                description: "For real estate professionals. Join our webinar to learn about Backyard, Samara's flagship accessory dwelling unit (ADU), and how to boost your income through our real estate partner program.\r\n\r\nWe'll cover:\r\n\r\n- ADU basics: why they're popular, what they cost, market insights, and more\r\n- Backyard 101: what sets Samara ADUs apart in design, quality, service, and sustainability\r\n- How to enroll in our partner program and our partner referral benefits\r\n\r\nReserve your spot today and build the future of housing in California with us!",
                class_names: "backyard showroom event",
                theme_color: "#000000",
                navigation_inverted: !1,
                partial_name: "partials/pages/showroom/event",
                position: -21
            },
            "/showrooms/events/open-house-thousand-oaks-240511": {
                title: "Open House: Thousand Oaks — Showrooms",
                description: "Drop by our Thousand Oaks pop-up and tour our stunning one-bedroom Backyard unit. Light refreshments and great vibes guaranteed.",
                class_names: "backyard showroom event",
                theme_color: "#000000",
                navigation_inverted: !1,
                partial_name: "partials/pages/showroom/event",
                position: -22
            },
            "/news/samara-raises-41-million-to-bring-high-quality-adus-to-every-backyard-in-california-and-beyond": {
                title: "Samara raises $41 million to bring high quality ADUs to every backyard in California and beyond — News",
                description: "![Samara co-founders Mike McNamara (left) and Joe Gebbia (right)",
                class_names: "newsroom",
                theme_color: "#000000",
                navigation_inverted: !1,
                partial_name: "partials/pages/newsroom/internal",
                position: -6
            }
        },
        t = {},
        a = document.querySelector("main .page"),
        o = document.querySelector("meta[name=theme-color]"),
        n = document.querySelector("nav"),
        i = document.querySelector("main");
    let r,
        s = [],
        c = !1;
    function l(e, t) {
        window.dispatchEvent(new CustomEvent(e, {
            detail: t
        }))
    }
    function d(e=null) {
        let t = e || location.pathname;
        return t = t.split("#")[0], t.length > 1 && t.endsWith("/") && (t = t.slice(0, t.length - 1)), "/" === t ? "/backyard" : t.startsWith("/backyard/configure") ? "/backyard/configure" : t
    }
    function u() {
        let t = e[d()];
        if (void 0 !== t) {
            null !== o && o.setAttribute("content", t.theme_color);
            const e = t.class_names.split(" ");
            e.length > 0 && document.body.classList.add(...e),
            null !== n && n.classList.toggle("inverted", t.navigation_inverted)
        }
        r = d()
    }
    async function m(o, h=!0, p=!0) {
        if (c)
            return void (s = [o, h]);
        if (h && (o === location.pathname || "/" === o && "/backyard" === location.pathname || "/backyard" === o && "/" === location.pathname))
            return l("router:scroll-top", {
                url: o
            }), void window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        c = !0,
        i.classList.add("segue");
        const f = function(t) {
            return (e[d(location.pathname)]?.position || 0) < (e[d(t)]?.position || 0) ? -1 : 1
        }(o);
        l("router:will-change-url", {
            url: o
        }),
        p && await function(e) {
            return new Promise((t => {
                i.addEventListener("animationend", t, {
                    once: !0
                }),
                i.classList.add(e < 0 ? "out-pop" : "out")
            }))
        }(f);
        let y = "";
        const g = d(o),
            w = t[g];
        if (w && "pending" !== w)
            y = w;
        else
            try {
                const e = await fetch(`${d(o)}.data`);
                y = await e.text(),
                t[g] = y
            } catch (e) {
                console.error("failed to load page", o)
            }
        !function() {
            const t = e[r || d()];
            if (void 0 !== t && null !== n) {
                const e = t.class_names.split(" ");
                e.length > 0 && document.body.classList.remove(...e),
                n.classList.toggle("inverted", !t.navigation_inverted)
            }
        }(),
        window.scrollTo({
            top: 0
        }),
        a.innerHTML = y,
        l("router:did-update-content", {
            url: o
        });
        const v = e[d(o)];
        document.title=v?.title,
        h && window.history.pushState(null, v, o),
        u(),
        p && await function(e) {
            return new Promise((t => {
                i.classList.remove(e < 0 ? "out-pop" : "out"),
                i.addEventListener("animationend", (() => {
                    i.classList.remove(e < 0 ? "in-pop" : "in"),
                    t()
                }), {
                    once: !0
                }),
                i.classList.add(e < 0 ? "in-pop" : "in")
            }))
        }(f),
        l("router:did-change-url", {
            url: o
        }),
        c = !1,
        setTimeout((() => {
            i.classList.remove("segue")
        }), 10),
        s.length > 0 && (setTimeout(m, 0, ...s), s = [])
    }
    function h(e) {
        if (!e)
            return null;
        const t = "A" === e.nodeName ? e : e.closest("a");
        if (!t)
            return null;
        const a = t.getAttribute("href");
        return a && a.startsWith("/") && !t.getAttribute("download") && "_blank" !== t.getAttribute("target") ? t : null
    }
    window.openRoute = m,
    window.addEventListener("click", (function(e) {
        if (e.metaKey)
            return;
        const t = h(e.target);
        t && (e.preventDefault(), m(t.getAttribute("href")))
    })),
    window.addEventListener("popstate", (function() {
        m(location.pathname, !1, !1)
    })),
    window.addEventListener("mousemove", (function(e) {
        const a = h(e.target);
        a && async function(e) {
            const a = d(e);
            if (!t[a]) {
                t[a] = "pending";
                try {
                    const o = await fetch(`${d(e)}.data`);
                    t[a] = await o.text()
                } catch (t) {
                    console.warn("failed to preload page", e)
                }
            }
        }(a.getAttribute("href"))
    })),
    window.addEventListener("router:will-change-url", (function() {
        document.body.classList.add("segue")
    })),
    window.addEventListener("router:did-change-url", (function() {
        document.body.classList.remove("segue")
    })),
    u()
})),
document.addEventListener("DOMContentLoaded", (function() {
    window.Tooltip = function() {
        const e = 1,
            t = 2e3,
            a = document.getElementById("tooltip"),
            o = a.querySelector("span");
        let n,
            i = !1,
            r = !1,
            s = {
                x: 0,
                y: 0
            },
            c = {
                x: 0,
                y: 0
            },
            l = !1;
        function d() {
            a.classList.add("dismissed")
        }
        function u() {
            document.querySelectorAll("*[data-tooltip]").forEach((e => {
                e.removeAttribute("data-tooltip"),
                e.addEventListener("mousemove", (function(t) {
                    const a = t.clientX < .5 * window.innerWidth;
                    return a && 0 === e.scrollLeft || !a & e.scrollLeft === e.scrollWidth - e.clientWidth ? (e.style.cursor = null, void f()) : (h(a ? "arrow-left" : "arrow-right", "", c.x, c.y), void (e.style.cursor = "pointer"))
                })),
                e.addEventListener("mouseleave", (function() {
                    e.style.cursor = null,
                    f()
                }))
            }))
        }
        function m() {
            document.querySelectorAll("*[data-tooltip-disabled]").forEach((e => {
                e.removeAttribute("data-tooltip-disabled"),
                e.addEventListener("mouseenter", (function() {
                    r = !0,
                    f()
                })),
                e.addEventListener("mouseleave", (function() {
                    r = !1
                }))
            }))
        }
        function h(e, t, n, l) {
            window.innerWidth < 768 || !1 !== document.hasFocus() && (r || (i || (s = {
                x: n,
                y: l
            }, c = {
                x: n,
                y: l
            }, y()), i = !0, a.className = "visible", a.classList.add(e), a.classList.toggle("tooltip-no-text", 0 === t.length), o.innerHTML = t))
        }
        function p(e, o) {
            clearTimeout(n),
            n = setTimeout(d, t),
            a.classList.remove("dismissed"),
            c = {
                x: e,
                y: o
            },
            l || requestAnimationFrame(y)
        }
        function f() {
            i && (a.classList.remove("visible"), i = !1)
        }
        function y() {
            0 === s.x && (s = c),
            s.x = s.x + (c.x - s.x) * e,
            s.y = s.y + (c.y - s.y) * e,
            a.style.transform = `translate3d(${s.x.toFixed(2)}px,${s.y.toFixed(2)}px,0.0)`,
            l = Math.abs(s.x - c.x) > .1 || Math.abs(s.y - c.y) > .1,
            l && requestAnimationFrame(y)
        }
        return document.documentElement.addEventListener("mouseleave", (function() {
            f()
        })), window.addEventListener("mousemove", (function(e) {
            p(e.clientX, e.clientY)
        })), window.addEventListener("router:did-update-content", m), window.addEventListener("router:did-update-content", u), window.addEventListener("scroll", (function() {
            f()
        })), m(), u(), {
            show: h,
            move: p,
            hide: f
        }
    }()
})),
window.Backyard = window.Backyard || {},
Backyard.createALotCanHappenCards = function() {
    const e = document.querySelector(".a-lot-can-happen-cards .infinite-slideshow");
    if (null === e)
        return () => {};
    const t = document.querySelector(".a-lot-can-happen-cards-label");
    let a,
        o;
    function n() {
        const a = e.querySelector(".current img");
        a && (t.classList.add("change"), setTimeout((() => {
            t.innerText = a.getAttribute("alt"),
            t.classList.remove("change")
        }), 200))
    }
    function i() {
        e.dispatchEvent(new CustomEvent("jump", {
            detail: {
                direction: 1
            }
        }))
    }
    function r() {
        clearTimeout(o),
        o = setTimeout(i, 4e3)
    }
    function s() {
        r()
    }
    return r(), e.addEventListener("change", (function() {
        t.classList.add("change"),
        clearTimeout(a),
        a = setTimeout(n, 200)
    })), e.addEventListener("scroll", (function() {
        r()
    })), e.addEventListener("click", (function(t) {
        const a = e.getBoundingClientRect(),
            o = t.clientX < a.x + .5 * a.width;
        e.dispatchEvent(new CustomEvent("jump", {
            detail: {
                direction: o ? -1 : 1
            }
        }))
    })), document.addEventListener("visibilitychange", s), function() {
        clearTimeout(o),
        document.removeEventListener("visibilitychange", s)
    }
},
window.Backyard = window.Backyard || {},
Backyard.createBentoCardDetails = function() {
    return document.querySelectorAll(".bento-details-card").forEach((function(e) {
        e.addEventListener("click", (function(t) {
            "INPUT" !== t.target.nodeName && (t.stopPropagation(), e.querySelector("input").click())
        })),
        e.querySelector("input").addEventListener("change", (function(t) {
            const a = t.target.checked,
                o = e.querySelector("ul");
            if (a) {
                o.style.transition = "none",
                o.style.maxHeight = "unset",
                o.style.opacity = 0;
                const e = o.clientHeight;
                o.style.transition = null,
                o.style.maxHeight = null,
                setTimeout((() => {
                    o.style.maxHeight = e + "px",
                    o.style.opacity = 1
                }), 0)
            } else
                o.style.maxHeight = null,
                o.style.opacity = null
        }))
    })), function() {}
},
window.Backyard = window.Backyard || {},
Backyard.createFaqMenu = function() {
    const e = document.querySelector(".backyard-faq .sidebar"),
        t = Array.from(e.querySelectorAll(".menu li")),
        a = Array.from(document.querySelectorAll(".backyard-faq .faq-group")),
        o = e.querySelector("h1");
    let n,
        i = !1,
        r = !1,
        s = window.scrollY;
    function c(e, t, a, o, n) {
        return o + (e - t) / (a - t) * (n - o)
    }
    function l() {
        if (r = !!i && s !== window.scrollY, r || (i = !1, function() {
            if (void 0 === a.findLastIndex)
                return;
            const e = Math.max(a.findLastIndex((e => e.getBoundingClientRect().top < .5 * window.innerHeight)), 0);
            t.forEach(((t, a) => {
                t.classList.toggle("active", a === e)
            }))
        }()), s = window.scrollY, r && (clearTimeout(n), n = setTimeout(l, 100)), window.innerWidth >= 768) {
            const e = Math.min(Math.max(c(window.scrollY, 0, 132, 0, 1), 0), 1),
                t = c(e, 0, 1, 0, 50),
                a = c(e, 0, 1, 1, .66);
            o.style.transform = `translateY(${t}px) scale(${a})`
        } else
            o.style.transform = null
    }
    return window.addEventListener("scroll", l, {
        passive: !0
    }), window.addEventListener("resize", l, {
        passive: !0
    }), l(), t.slice(0, -1).forEach(((e, o) => {
        e.addEventListener("click", (function() {
            const e = window.scrollY + a[o].getBoundingClientRect().top - 150;
            t.forEach(((e, t) => {
                e.classList.toggle("active", o === t)
            })),
            i = !0,
            window.scrollTo({
                top: e,
                behavior: "smooth"
            })
        }))
    })), function() {
        window.removeEventListener("scroll", l),
        window.removeEventListener("resize", l)
    }
},
window.Backyard = window.Backyard || {},
Backyard.createInteriorPhotoCards = function() {
    return document.querySelectorAll(".interior-carousel-cards-card").forEach(((e, t, a) => {
        e.addEventListener("click", (function(t) {
            const o = window.innerWidth < 768,
                {left: n, width: i} = e.getBoundingClientRect(),
                r = Math.round(n + .5 * i),
                s = .5 * window.innerWidth - r;
            if (!o && s > 0 && Math.abs(s) > .5 * i)
                t.stopPropagation(),
                e.parentElement.classList.add("scrolling"),
                e.parentElement.scrollTo({
                    left: e.parentElement.scrollLeft - e.clientWidth,
                    behavior: "smooth"
                });
            else if (!o && s < 0 && Math.abs(s) > .5 * i)
                t.stopPropagation(),
                e.parentElement.classList.add("scrolling"),
                e.parentElement.scrollTo({
                    left: e.parentElement.scrollLeft + e.clientWidth,
                    behavior: "smooth"
                });
            else if (t.target.classList.contains("interior-carousel-cards-card-images")) {
                t.preventDefault(),
                t.stopPropagation();
                const a = e.querySelectorAll("input"),
                    o = Array.from(a).findIndex((e => e.checked)),
                    n = o + 1 > a.length - 1 ? 0 : o + 1;
                a.forEach(((e, t) => {
                    e.checked = t === n
                }))
            }
            setTimeout((function() {
                a.forEach((e => {
                    const {left: t, width: a} = e.getBoundingClientRect(),
                        o = Math.round(t + .5 * a),
                        n = .5 * window.innerWidth - o;
                    e.parentElement.classList.remove("scrolling"),
                    e.classList.toggle("current", Math.abs(n) < .5 * a)
                }))
            }), 600)
        }))
    })), function() {}
},
window.Backyard = window.Backyard || {},
Backyard.introCarousel = function() {
    const e = ["Two bedroom", "One bedroom", "Studio"],
        t = ["690 sq. ft.", "540 sq. ft.", "420 sq. ft."],
        a = document.querySelector(".intro-carousel-new .infinite-slideshow");
    if (!a)
        return () => {};
    const o = a.querySelectorAll("img");
    let n = 0;
    function i(a) {
        if (a === n)
            return;
        n = a;
        const i = document.getElementById("intro-carousel-layout-name");
        i && (i.innerText = e[n]);
        const r = document.getElementById("intro-carousel-layout-area");
        r && (r.innerText = t[n]),
        o.forEach(((e, t) => {
            e.classList.toggle("current", t === n)
        }))
    }
    function r() {
        requestAnimationFrame((() => {
            const {top: e, bottom: t} = a.getBoundingClientRect();
            isVisible = e < window.innerHeight && t > 0
        }))
    }
    let s = !1;
    return a.addEventListener("change", (function(e) {
        i(e.detail.index)
    })), a.addEventListener("click", (function(e) {
        s || window.innerWidth < 768 || (s = !0, setTimeout((() => {
            s = !1
        }), 400), a.dispatchEvent(new CustomEvent("jump", {
            detail: {
                direction: e.clientX < .5 * window.innerWidth ? -1 : 1
            }
        })))
    })), a.addEventListener("offset", (function(e) {
        var t;
        i((t = e.detail.targetIndex, Math.trunc(t - Math.floor(t / o.length) * o.length)))
    })), document.addEventListener("scroll", r, {
        passive: !0
    }), window.addEventListener("resize", r), r(), function() {
        document.removeEventListener("scroll", r),
        window.removeEventListener("resize", r)
    }
},
window.Backyard = window.Backyard || {},
Backyard.intro = function() {
    const e = document.querySelector(".backyard .intro"),
        t = e.querySelectorAll(".part");
    function a() {
        window.innerWidth;
        const e = (a = window.scrollY, o = 0, n = .25 * window.innerHeight, (i = 0) + (a - o) / (n - o) * (1 - i));
        var a,
            o,
            n,
            i;
        const r = Math.min(Math.max(Math.round(e * t.length), 0), t.length - 1);
        t.forEach(((e, t) => {
            e.classList.toggle("active", t <= r)
        }))
    }
    if ("undefined" != typeof experimentValueFor) {
        const t = e.querySelector("#cta-experiment");
        t && (t.innerText = experimentValueFor("cta", "text"))
    }
    return window.addEventListener("scroll", a, {
        passive: !0
    }), window.addEventListener("resize", a), a(), setTimeout((async function() {
        if (!1 === window.innerWidth < 768)
            return;
        function t(e) {
            return new Promise((t => {
                setTimeout(t, e)
            }))
        }
        const a = Array.from(e.querySelectorAll("span[data-sentence]")).reduce(((e, t) => {
            const a = parseInt(t.dataset.sentence) - 1;
            return e[a] ? e[a].push(t) : e[a] = [t], e
        }), []);
        for (let e = 0; e < a.length; e++)
            a[e].forEach((e => {
                e.classList.add("active")
            })),
            await t(0 === e ? 1250 : 1e3)
    }), 200), e.querySelectorAll("h1 img").forEach((e => {
        e.complete ? e.classList.add("loaded") : e.addEventListener("load", (() => e.classList.add("loaded")), {
            once: !0
        })
    })), function() {
        window.removeEventListener("scroll", a),
        window.removeEventListener("resize", a)
    }
},
window.addEventListener("DOMContentLoaded", (() => {
    setTimeout((() => {
        document.body.classList.add("intro-complete")
    }), 2e3)
})),
window.Backyard = window.Backyard || {},
Backyard.invertNavigation = function() {
    const e = document.getElementsByTagName("nav")[0],
        t = Array.from(document.querySelectorAll(".slides > *, article > *"));
    function a() {
        const a = window.innerWidth < 768,
            o = t.find((e => {
                const t = a ? 45 : 65,
                    {top: o, bottom: n} = e.getBoundingClientRect();
                return o < t && n > t
            }));
        if (o)
            if (a && o.dataset.invertMobile) {
                const t = "true" === o.dataset.invertMobile;
                e.classList.toggle("inverted", t)
            } else
                e.classList.toggle("inverted", void 0 !== o.dataset.invert)
    }
    return window.addEventListener("scroll", a, {
        passive: !0
    }), a(), function() {
        window.removeEventListener("scroll", a)
    }
},
window.Backyard = window.Backyard || {},
Backyard.createJealousy = function() {
    const e = document.querySelector(".jealousy");
    if (null === e)
        return () => {};
    const t = Array.from(document.querySelectorAll(".jealousy input"));
    let a;
    function o() {
        e.classList.remove("active"),
        t.forEach(((e, t) => e.checked = 1 === t))
    }
    function n(n) {
        if (clearTimeout(a), a = setTimeout(o, 1e4), e.classList.add("active"), "INPUT" === n.target.nodeName)
            return;
        let i = t.findIndex((e => !0 === e.checked));
        i < t.length - 1 ? i += 1 : i = 0,
        t.forEach(((e, t) => e.checked = t === i))
    }
    return e.addEventListener("click", n), function() {
        e.removeEventListener("click", n)
    }
},
window.Backyard = window.Backyard || {},
Backyard.loadImagesLazily = function() {
    const e = new IntersectionObserver((t => {
        t.forEach((({isIntersecting: t, target: a}) => {
            t && (a.setAttribute("loading", "eager"), "VIDEO" === a.nodeName && a.clientWidth > 0 && (a.load(), a.addEventListener("canplay", (() => {
                a.play().catch((() => {}))
            }), {
                once: !0
            })), e.unobserve(a))
        }))
    }), {
        rootMargin: "100%"
    });
    return document.querySelectorAll("*[loading=lazy]").forEach((t => {
        e.observe(t)
    })), function() {
        e.disconnect()
    }
},
window.Backyard = window.Backyard || {},
Backyard.threeSizes = function() {
    const e = [[269e3, 1611], [284e3, 1701], [324e3, 1940]],
        t = {
            desktop: [[0, .33, 0, 34], [0, .66, -29.5, 29.5], [.33, .66, -24, 0]],
            mobile: [[0, .33, 0, 29], [0, .66, -23, 23], [.33, .66, -16, 0]]
        },
        a = document.querySelector(".three-sizes-layouts-pages-container"),
        o = Array.from(document.querySelectorAll(".three-sizes-layouts-selector button")),
        n = Array.from(document.querySelectorAll(".three-sizes-layouts-pages-page")),
        i = Array.from(document.querySelectorAll(".three-sizes-colors > div")),
        r = Array.from(document.querySelectorAll(".three-sizes-layouts-pages-controls button"));
    let s,
        c = 1,
        l = Array(n.length).fill(0);
    function d(e, t) {
        c = Math.max(Math.min(e, n.length - 1), 0),
        a.scrollTo({
            left: e * a.clientWidth,
            behavior: t ? "instant" : "smooth"
        }),
        a.dispatchEvent(new CustomEvent("change", {
            detail: {
                index: e
            }
        })),
        m(t)
    }
    function u(e) {
        let t = e;
        !1 === Number.isFinite(t) && (t = 0);
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(t)
    }
    function m(d) {
        d ? (clearTimeout(s), a.classList.add("without-animation"), s = setTimeout((() => {
            a.classList.remove("without-animation")
        }), 100)) : a.classList.remove("without-animation");
        const m = Math.max(Math.min(Math.round(a.scrollLeft / a.scrollWidth * n.length), n.length - 1), 0);
        Number.isFinite(m) && (c = m, a.dispatchEvent(new CustomEvent("change", {
            detail: {
                index: c
            }
        })));
        const h = a.scrollLeft / a.scrollWidth,
            p = window.innerWidth < 768 ? "mobile" : "desktop";
        n.forEach(((e, a) => {
            e.classList.toggle("selected", a === c),
            e.querySelectorAll("img").forEach(((e, t) => {
                e.classList.toggle("current", t === l[a])
            }));
            const [o, n, i, r] = t[p][a],
                s = (u = i) + (h - (d = o)) / (n - d) * (r - u);
            var d,
                u;
            e.querySelector(".three-sizes-layouts-pages-image").style.transform = `translate3d(${s}vw, 0, 0)`
        })),
        o.forEach(((e, t) => {
            e.classList.toggle("selected", t === c)
        })),
        i.forEach(((e, t) => {
            e.classList.toggle("selected", t === l[c])
        })),
        r.forEach(((e, t) => {
            0 === t && 0 === c || 1 === t && c === n.length - 1 ? e.disabled = !0 : e.disabled = !1
        }));
        const f = document.getElementById("three-sizes-footer-cost-total");
        f && (f.innerText = u(e[c][0]));
        const y = document.getElementById("three-sizes-footer-cost-monthly");
        y && (y.innerText = `${u(e[c][1])}/mo`);
        const g = document.getElementById("three-sizes-footer-configure-link");
        g && (g.href = `/backyard/configure#${["bonewhite", "driftwood", "parchment", "evergreen", "dark-bronze"][l[c]]}+${["studio", "onebed", "twobed"][c]}`)
    }
    function h(e) {
        m(e && "resize" === e.type)
    }
    return o.forEach(((e, t) => {
        e.addEventListener("click", (function() {
            d(t)
        }))
    })), i.forEach(((e, t) => {
        e.addEventListener("click", (function() {
            l[c] = t,
            m()
        }))
    })), r.forEach(((e, t) => {
        e.addEventListener("click", (function() {
            switch (t) {
            case 0:
                d(c - 1);
                break;
            case 1:
                d(c + 1);
                break;
            default:
                return
            }
            m()
        }))
    })), a.addEventListener("scroll", h), a.addEventListener("click", (function(e) {
        window.innerWidth < 768 || (e.clientX < .5 * a.clientWidth ? c > 0 && d(c - 1) : e.clientX > .5 * a.clientWidth && c < n.length - 1 && d(c + 1))
    })), a.addEventListener("mousemove", (function(e) {
        r[0].classList.toggle("highlight", e.clientX < .5 * a.clientWidth),
        r[1].classList.toggle("highlight", e.clientX > .5 * a.clientWidth),
        e.clientX < .5 * a.clientWidth ? a.style.cursor = 0 === c ? null : "pointer" : e.clientX > .5 * a.clientWidth && (a.style.cursor = c === n.length - 1 ? null : "pointer")
    })), a.addEventListener("mouseleave", (function() {
        r.forEach((e => {
            e.classList.remove("highlight")
        }))
    })), window.addEventListener("resize", h, {
        passive: !0
    }), document.addEventListener("scroll", h, {
        passive: !0
    }), d(1, !0), document.querySelector(".three-sizes-footer-calculator").addEventListener("click", (function() {
        Calculator.show("calculator-imageless", void 0, void 0, c)
    })), function() {
        window.removeEventListener("scroll", h),
        window.removeEventListener("resize", h)
    }
},
"complete" === document.readyState && document.body.classList.add("complete"),
window.addEventListener("load", (() => {
    document.body.classList.add("complete")
}), {
    once: !0
}),
createDestroy(/^(\/|\/backyard|\/backyard\/)$/, (function() {
    const e = [Backyard.intro(), Backyard.introCarousel(), Backyard.invertNavigation(), Backyard.loadImagesLazily(), Backyard.threeSizes(), Backyard.createInteriorPhotoCards(), Backyard.createALotCanHappenCards(), Backyard.createBentoCardDetails(), Backyard.createJealousy()];
    return function() {
        e.forEach((e => {
            e()
        }))
    }
})),
createDestroy(/^\/backyard\/configure.*/, (function() {
    return createApplication("configurator", {}, "/assets/javascripts/configurator/bundle/index.js")
}), "router:did-update-content"),
createDestroy(/^\/showrooms\/events.*|^\/events.*/, (function() {
    return createApplication("event")
}), "router:did-update-content"),
createDestroy(/^\/backyard\/faq.*/, (function() {
    const e = [Backyard.invertNavigation(), Backyard.createFaqMenu()];
    return function() {
        e.forEach((e => {
            e()
        }))
    }
})),
createDestroy(/^\/backyard\/how-it-works.*/, (function() {
    const e = [Backyard.invertNavigation()];
    return function() {
        e.forEach((e => {
            e()
        }))
    }
})),
(() => {
    const e = {
        "/": {
            title: "Samara",
            description: "Discover Samara's Backyard accessory dwelling units. Elevated design, expertly crafted. Fast and easy installation. Solar-powered and future-ready.",
            class_names: "backyard",
            theme_color: "#000000",
            navigation_inverted: !1,
            position: 1,
            partial_name: "partials/pages/backyard/backyard",
            share_sheet_image_id: "fa1c5758-e587-4b4b-e3f1-a625a73b4500"
        },
        "/showrooms/thousand-oaks/visit": {
            title: "Schedule Your Showroom Visit – Samara",
            description: "",
            class_names: "",
            theme_color: "#000000",
            navigation_inverted: !1,
            position: 0,
            partial_name: "partials/pages/showroom/visit",
            share_sheet_image_id: null
        },
        "/backyard": {
            title: "Backyard – Samara",
            description: "Discover Samara's Backyard accessory dwelling units. Elevated design, expertly crafted. Fast and easy installation. Solar-powered and future-ready.",
            class_names: "backyard",
            theme_color: "#000000",
            navigation_inverted: !1,
            position: 0,
            partial_name: "partials/pages/backyard/backyard",
            share_sheet_image_id: "43d12c31-d3f4-49aa-be9b-511972d1bc00"
        },
        "/backyard/how-it-works": {
            title: "Backyard – How It Works – Samara",
            description: "Learn how easy it is to install an accessory dwelling unit from Samara. From configuration to completion in as few as seven months.",
            class_names: "backyard how-it-works",
            theme_color: "#000000",
            navigation_inverted: !1,
            position: -1,
            partial_name: "partials/pages/backyard/how-it-works",
            share_sheet_image_id: "26440ce7-ba39-472d-0fec-c1d99823a500"
        },
        "/backyard/tech-specs": {
            title: "Backyard – Technical Specifications – Samara",
            description: "See floor plans, technical specifications, and what's included in Backyard studio, one bedroom, and two bedroom models.",
            class_names: "backyard tech-specs",
            theme_color: "#000000",
            navigation_inverted: !1,
            position: -2,
            partial_name: "partials/pages/backyard/tech-specs",
            share_sheet_image_id: "0499c9a9-7a5c-484a-7d7f-6892ddb2d400"
        },
        "/backyard/faq": {
            title: "Backyard – Frequently Asked Questions – Samara",
            description: "Find answers to the most asked questions about Backyard: building regulations, financial planning, construction, and more.",
            class_names: "backyard faq",
            theme_color: "#000000",
            navigation_inverted: !1,
            position: -3,
            partial_name: "partials/pages/backyard/faq",
            share_sheet_image_id: "525b3d2c-6270-4ef5-d824-ecd2f4edd000"
        },
        "/backyard/configure": {
            title: "Customize Backyard – Samara",
            description: "Customize and get a quote for Samara's Backyard accessory dwelling unit. Elevated design, expertly crafted. Fast and easy installation. Solar-powered and future-ready.",
            class_names: "backyard configurator",
            theme_color: "#000000",
            navigation_inverted: !1,
            position: -4,
            partial_name: "partials/pages/backyard/configure",
            share_sheet_image_id: "a02d2050-630d-403d-d386-ccb3506c2300"
        },
        "/news": {
            title: "News – Samara",
            description: "Read the latest news about Samara.",
            class_names: "newsroom",
            theme_color: "#000000",
            navigation_inverted: !1,
            position: -6,
            partial_name: "partials/pages/newsroom/newsroom",
            share_sheet_image_id: "7fd49401-f728-4c12-0229-3fe7abf62900"
        },
        "/jobs": {
            title: "Jobs – Samara",
            description: "Join Samara to help create new ways of living that help people dream bigger.",
            class_names: "jobs",
            theme_color: "#000000",
            navigation_inverted: !1,
            position: -9,
            partial_name: "partials/pages/jobs/jobs",
            share_sheet_image_id: "69bca2cb-e628-48ad-c8fc-ebd743b2c700"
        },
        "/showrooms/redwood-city": {
            title: "Redwood City Showroom – Samara",
            description: "Tour Backyard in person at Samara Redwood City. Find our hours and learn how to book a private tour.",
            class_names: "backyard showroom tour",
            theme_color: "#000000",
            navigation_inverted: !1,
            position: -10,
            partial_name: "partials/pages/showroom/redwood-city",
            share_sheet_image_id: "8e379157-712c-4bea-a50a-38c36767db00"
        },
        "/showrooms": {
            title: "Showrooms – Samara",
            description: "Tour Backyard in person at an our San Francisco Bay Area and Los Angeles showrooms. Learn more about our locations and book a private tour.",
            class_names: "backyard showroom",
            theme_color: "#000000",
            navigation_inverted: !1,
            position: -10,
            partial_name: "partials/pages/showroom/showroom",
            share_sheet_image_id: "7f28da8b-6ec2-423a-f3a8-8a5e7ffa4500"
        },
        "/showrooms/redwood-city/visit": {
            title: "Schedule Your Showroom Visit – Samara",
            description: "Tour Backyard in person at Samara Redwood City. Find our hours and learn how to book a private tour.",
            class_names: "backyard showroom tour",
            theme_color: "#000000",
            navigation_inverted: !1,
            position: -11,
            partial_name: "partials/pages/showroom/visit",
            share_sheet_image_id: "6b07701e-267e-4d6f-b0ea-a32fd8c27a00"
        },
        "/showrooms/thousand-oaks": {
            title: "Thousand Oaks Pop-up Showroom – Samara",
            description: "Tour Backyard in person at Samara Thousand Oaks. Find our hours and learn how to book a private tour.",
            class_names: "backyard showroom tour",
            theme_color: "#000000",
            navigation_inverted: !1,
            position: -12,
            partial_name: "partials/pages/showroom/thousand-oaks",
            share_sheet_image_id: "00cc326f-f637-4227-f98d-dff49167c900"
        },
        "/developers": {
            title: "Samara for Developers",
            description: "Unlock the potential of your parcel with Backyard Multiunit.",
            class_names: "multiunit",
            theme_color: "#000000",
            navigation_inverted: !1,
            position: -13,
            partial_name: "partials/pages/multiunit",
            share_sheet_image_id: "a6119568-ae31-44e7-e7a6-ad201ad8a500"
        },
        "/yoshino": {
            title: "Yoshino – Samara",
            description: null,
            class_names: "yoshino",
            theme_color: "#000000",
            navigation_inverted: !1,
            position: -14,
            partial_name: "partials/pages/yoshino",
            share_sheet_image_id: null
        },
        "/terms-of-service": {
            title: "Terms of Service – Samara",
            description: "",
            class_names: "legal",
            theme_color: "#000000",
            navigation_inverted: !1,
            position: -15,
            partial_name: "partials/pages/terms-of-service",
            share_sheet_image_id: "834edb4b-cd31-423c-4ed3-1accf2066200"
        },
        "/privacy-policy": {
            title: "Privacy Policy – Samara",
            description: null,
            class_names: "legal",
            theme_color: "#000000",
            navigation_inverted: !1,
            position: -16,
            partial_name: "partials/pages/privacy-policy",
            share_sheet_image_id: "94f4f098-aa84-4d11-1b87-65836380a800"
        },
        "/jobs/sales-operations-manager": {
            title: "Sales Operations Manager – Jobs – Samara",
            description: "Join Samara to help create new ways of living that help people dream bigger.",
            class_names: "jobs job",
            theme_color: "#000000",
            navigation_inverted: !1,
            partial_name: "partials/pages/jobs/job",
            position: -9
        },
        "/jobs/sales-account-executive": {
            title: "Sales Account Executive (Project Specialist) – Jobs – Samara",
            description: "Join Samara to help create new ways of living that help people dream bigger.",
            class_names: "jobs job",
            theme_color: "#000000",
            navigation_inverted: !1,
            partial_name: "partials/pages/jobs/job",
            position: -10
        },
        "/jobs/supply-chain-director": {
            title: "Supply Chain Director – Jobs – Samara",
            description: "Join Samara to create new ways of living that help people dream bigger.",
            class_names: "jobs job",
            theme_color: "#000000",
            navigation_inverted: !1,
            partial_name: "partials/pages/jobs/job",
            position: -11
        },
        "/showrooms/events/watsonville-crane-in-event": {
            title: "Watsonville Crane-in Event — Showrooms",
            description: "We’d love to see you at our crane-in event in Watsonville!\r\n\r\n- Watch Samara’s Backyard ADU get installed in minutes\r\n- Enjoy music, coffee, and other refreshments\r\n- Meet the Samara team and get a free site assessment\r\n\r\nPlease RSVP for the complete address and day-of schedule.\r\n",
            class_names: "backyard showroom event",
            theme_color: "#000000",
            navigation_inverted: !1,
            partial_name: "partials/pages/showroom/event",
            position: -20
        },
        "/showrooms/events/webinar-introducing-samaras-real-estate-partner-program": {
            title: "Webinar: Introducing Samara's Real Estate Partner Program — Showrooms",
            description: "For real estate professionals. Join our webinar to learn about Backyard, Samara's flagship accessory dwelling unit (ADU), and how to boost your income through our real estate partner program.\r\n\r\nWe'll cover:\r\n\r\n- ADU basics: why they're popular, what they cost, market insights, and more\r\n- Backyard 101: what sets Samara ADUs apart in design, quality, service, and sustainability\r\n- How to enroll in our partner program and our partner referral benefits\r\n\r\nReserve your spot today and build the future of housing in California with us!",
            class_names: "backyard showroom event",
            theme_color: "#000000",
            navigation_inverted: !1,
            partial_name: "partials/pages/showroom/event",
            position: -21
        },
        "/showrooms/events/open-house-thousand-oaks-240511": {
            title: "Open House: Thousand Oaks — Showrooms",
            description: "Drop by our Thousand Oaks pop-up and tour our stunning one-bedroom Backyard unit. Light refreshments and great vibes guaranteed.",
            class_names: "backyard showroom event",
            theme_color: "#000000",
            navigation_inverted: !1,
            partial_name: "partials/pages/showroom/event",
            position: -22
        },
        "/news/samara-raises-41-million-to-bring-high-quality-adus-to-every-backyard-in-california-and-beyond": {
            title: "Samara raises $41 million to bring high quality ADUs to every backyard in California and beyond — News",
            description: "![Samara co-founders Mike McNamara (left) and Joe Gebbia (right)",
            class_names: "newsroom",
            theme_color: "#000000",
            navigation_inverted: !1,
            partial_name: "partials/pages/newsroom/internal",
            position: -6
        }
    };
    let t = [],
        a = !1;
    function o() {
        a = t.length > 0,
        t.forEach((e => {
            e.element.parentElement || document.body.appendChild(e.element),
            (e.x + e.vx < 0 && e.vx < 0 || e.x + e.vx + 2 * e.radius > window.innerWidth && e.vx > 0) && (e.vx *= -1),
            (e.y + e.vy < 0 && e.vy < 0 || e.y + e.vy + 2 * e.radius > window.innerHeight && e.vy > 0) && (e.vy *= -1),
            (e.vx < -.5 || e.vx > .5) && (e.vx *= .99),
            (e.vy < -.5 || e.vy > .5) && (e.vy *= .99),
            e.x += e.vx,
            e.y += e.vy,
            e.x = Math.min(Math.max(e.x, 0), window.innerWidth - 2 * e.radius),
            e.y = Math.min(Math.max(e.y, 0), window.innerHeight - 2 * e.radius),
            e.element.style.transform = `translate3d(${e.x}px, ${e.y}px, 0)`
        })),
        t.length && requestAnimationFrame(o)
    }
    createDestroy(/^\/jobs.*/, (function() {
        if (t.length)
            return;
        const n = Object.keys(e).filter((e => e.startsWith("/jobs/"))).length;
        return t = [], Array(n).fill(null).forEach((() => {
            setTimeout((() => {
                const e = function() {
                    const e = document.querySelector(".jobs .jobs");
                    if (!e)
                        return;
                    const t = e.classList.contains("empty"),
                        a = Math.random() * (window.innerWidth - 7),
                        o = Math.random() * (window.innerHeight - 7),
                        n = 2 * Math.random() - 1,
                        i = 2 * Math.random() - 1,
                        r = Math.sqrt(n * n + i * i),
                        s = n / r * .5,
                        c = i / r * .5,
                        l = document.createElement("div");
                    return l.className = "dot", l.style.width = "14px", l.style.height = "14px", l.style.opacity = t ? .3 : null, {
                        x: a,
                        y: o,
                        vx: s,
                        vy: c,
                        radius: 7,
                        element: l
                    }
                }();
                void 0 !== e && t.push(e),
                a || o()
            }), 500 * Math.random() * n)
        })), function() {
            t.forEach((e => {
                e.element && document.body.removeChild(e.element)
            })),
            t = []
        }
    }), "router:did-update-content")
})(),
createDestroy(/^\/developers.*/, (function() {
    return document.querySelector("nav .backyard-configure.multiunit").addEventListener("click", (function(e) {
        e.stopPropagation(),
        e.preventDefault();
        const t = document.querySelector(".multiunit-hr").getBoundingClientRect();
        window.scrollTo({
            top: window.scrollY + t.top,
            behavior: "smooth"
        })
    })), createApplication("multiunit")
}), "router:did-update-content"),
createDestroy(/^\/news/, (function() {
    const e = [Backyard.invertNavigation()];
    return function() {
        e.forEach((e => {
            e()
        }))
    }
})),
(() => {
    function e(e) {
        e.parentElement.classList.add("newsroom-internal-feedback-visible"),
        setTimeout((() => {
            e.parentElement.classList.remove("newsroom-internal-feedback-visible")
        }), 3e3)
    }
    globalThis.Newsroom = {
        copyText(t) {
            t.preventDefault();
            const a = document.querySelector("h1").innerText,
                o = Array.from(document.querySelectorAll("time, .newsroom-internal-body p, .newsroom-internal-body blockquote, .newsroom-internal-body li")).map((e => "LI" === e.nodeName ? `\n- ${e.innerText}\n` : `\n${e.innerText}\n`)).join("");
            navigator.clipboard.writeText(`${a}\n${o}`),
            e(t.target)
        },
        downloadImages(e) {
            e.preventDefault(),
            document.querySelectorAll(".newsroom img[data-downloadable]").forEach((e => {
                const t = document.createElement("a");
                t.href = e.src,
                t.target = "_blank",
                t.download = e.src.split("/").reverse()[0],
                t.click()
            }))
        },
        copyLink(t) {
            navigator.clipboard.writeText(location.href),
            e(t.target)
        }
    }
})(),
createDestroy(/^(\/showrooms|\/showrooms\/|\/showrooms\/.*)$/, (function() {
    const e = Date.now();
    document.querySelectorAll(".showroom-events").forEach((t => {
        const a = Showroom.events.filter((e => e.showroom === t.dataset.showroom));
        t.dataset.numberOfEvents = a.filter((t => Date.parse(t.start_at) > e)).length,
        t.querySelectorAll("li").forEach((t => {
            t.hidden = Date.parse(t.dataset.startAt) <= e
        }))
    }));
    const t = Backyard.loadImagesLazily();
    return function() {
        t()
    }
}), "router:did-update-content"),
createDestroy(/^\/showrooms\/.*\/visit.*/, (function() {
    return createApplication("showroom")
}), "router:did-update-content"),
globalThis.Showroom = {
    events: [{
        title: "Watsonville Crane-in Event",
        slug: "watsonville-crane-in-event",
        showroom: "",
        image_id: "23012e6f-8477-4d63-179f-4040ab711900",
        location_title: "Watsonville, CA",
        location_url: "",
        description: "We’d love to see you at our crane-in event in Watsonville!\r\n\r\n- Watch Samara’s Backyard ADU get installed in minutes\r\n- Enjoy music, coffee, and other refreshments\r\n- Meet the Samara team and get a free site assessment\r\n\r\nPlease RSVP for the complete address and day-of schedule.\r\n",
        start_at: "2024-05-07T10:30:00.000+00:00",
        end_at: "2024-05-07T12:00:00.000+00:00",
        is_published: !0
    }, {
        title: "Open House: Discover Backyard",
        slug: "open-house-discover-backyard",
        showroom: "redwood-city",
        image_id: null,
        location_title: null,
        location_url: null,
        description: "Drop by Samara Redwood City for a coffee and learn what the hype around Backyard is all about. Tour a Backyard Studio unit, check out our materials, and get answers to your questions from our team of specialists.",
        start_at: "2024-01-20T13:00:00.000+00:00",
        end_at: "2024-01-20T16:00:00.000+00:00",
        is_published: !1
    }, {
        title: "Webinar: Introducing Samara's Real Estate Partner Program",
        slug: "webinar-introducing-samaras-real-estate-partner-program",
        showroom: "redwood-city",
        image_id: "e3d2c7e0-3089-4414-9b55-234fed4b2b00",
        location_title: "Online (Zoom Meeting)",
        location_url: "",
        description: "For real estate professionals. Join our webinar to learn about Backyard, Samara's flagship accessory dwelling unit (ADU), and how to boost your income through our real estate partner program.\r\n\r\nWe'll cover:\r\n\r\n- ADU basics: why they're popular, what they cost, market insights, and more\r\n- Backyard 101: what sets Samara ADUs apart in design, quality, service, and sustainability\r\n- How to enroll in our partner program and our partner referral benefits\r\n\r\nReserve your spot today and build the future of housing in California with us!",
        start_at: "2024-04-26T13:00:00.000+00:00",
        end_at: "2024-04-26T14:00:00.000+00:00",
        is_published: !0
    }, {
        title: "Open House: Thousand Oaks",
        slug: "open-house-thousand-oaks-240511",
        showroom: "thousand-oaks",
        image_id: null,
        location_title: "",
        location_url: "",
        description: "Drop by our Thousand Oaks pop-up and tour our stunning one-bedroom Backyard unit. Light refreshments and great vibes guaranteed.",
        start_at: "2024-05-11T11:00:00.000+00:00",
        end_at: "2024-05-11T14:00:00.000+00:00",
        is_published: !0
    }],
    jumpTo(e) {
        const t = document.getElementById(e).getBoundingClientRect(),
            a = window.innerWidth <= 768 ? 100 : 120;
        window.scrollTo({
            top: t.top - a,
            behavior: "smooth"
        })
    }
},
createDestroy(/^\/backyard\/tech-specs.*/, (function() {
    const e = [Backyard.invertNavigation()];
    return function() {
        e.forEach((e => {
            e()
        }))
    }
})),
globalThis.gtag = globalThis.gtag || (() => {}),
document.addEventListener("DOMContentLoaded", (() => {
    document.body.classList.remove("no-javascript")
}));
//# sourceMappingURL=index.js.map
