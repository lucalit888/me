/* Luca Lit — portfolio interactions (vanilla JS, no dependencies) */
(function () {
	"use strict";

	var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	var isTouch = window.matchMedia("(hover: none)").matches;

	/* ---------- Navbar: solid-on-scroll + mobile menu ---------- */
	var nav = document.querySelector(".nav");
	var navToggle = document.querySelector(".nav-toggle");
	var navLinks = document.querySelectorAll(".nav-links a");

	var lastScrollY = window.scrollY;

	function onScrollNav() {
		var y = window.scrollY;
		nav.classList.toggle("scrolled", y > 40);
		// Hide the bar while scrolling down past the hero; bring it back on scroll-up
		if (nav.classList.contains("menu-open") || y < window.innerHeight * 0.6) {
			nav.classList.remove("hidden");
		} else if (y > lastScrollY + 6) {
			nav.classList.add("hidden");
		} else if (y < lastScrollY - 6) {
			nav.classList.remove("hidden");
		}
		lastScrollY = y;
	}

	if (navToggle) {
		navToggle.addEventListener("click", function () {
			var open = nav.classList.toggle("menu-open");
			document.body.classList.toggle("menu-locked", open);
			navToggle.setAttribute("aria-expanded", open ? "true" : "false");
		});
	}

	navLinks.forEach(function (link) {
		link.addEventListener("click", function () {
			nav.classList.remove("menu-open");
			document.body.classList.remove("menu-locked");
			if (navToggle) navToggle.setAttribute("aria-expanded", "false");
		});
	});

	/* ---------- Scroll progress bar + back-to-top ---------- */
	var progress = document.querySelector(".scroll-progress");
	var backTop = document.querySelector(".back-top");
	var ticking = false;

	function onScroll() {
		if (ticking) return;
		ticking = true;
		window.requestAnimationFrame(function () {
			var max = document.documentElement.scrollHeight - window.innerHeight;
			if (progress) progress.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
			if (backTop) backTop.classList.toggle("show", window.scrollY > window.innerHeight * 0.8);
			onScrollNav();
			parallaxHero();
			ticking = false;
		});
	}

	window.addEventListener("scroll", onScroll, { passive: true });
	onScroll();

	if (backTop) {
		backTop.addEventListener("click", function () {
			window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
		});
	}

	/* ---------- Hero parallax ---------- */
	var heroBg = document.querySelector(".hero-bg");

	function parallaxHero() {
		if (!heroBg) return;
		if (prefersReducedMotion || window.innerWidth < 768) {
			heroBg.style.transform = "";
			return;
		}
		var y = window.scrollY;
		heroBg.style.transform = y < window.innerHeight * 1.2 ? "translate3d(0," + y * 0.35 + "px,0)" : "";
	}

	window.addEventListener("resize", onScroll, { passive: true });

	/* ---------- Hero bubbles: exhaled bursts every ~2s from the mask's side ---------- */
	var bubbleWrap = document.querySelector(".bubbles");
	var maskFrame = document.querySelector(".mask-frame");

	function spawnBubbles(originX, originY, count, sizeBase, sizeVar) {
		for (var i = 0; i < count; i++) {
			var b = document.createElement("span");
			var size = sizeBase + Math.random() * sizeVar;
			b.style.width = size + "px";
			b.style.height = size + "px";
			b.style.left = originX + (Math.random() - 0.5) * 52 + "px";
			b.style.top = originY + (Math.random() - 0.5) * 30 + "px";
			b.style.animation = "bubbleRise " + (3.2 + Math.random() * 2.2).toFixed(2) + "s linear forwards";
			b.style.animationDelay = (Math.random() * 0.5).toFixed(2) + "s";
			b.addEventListener("animationend", function (e) { e.target.remove(); });
			bubbleWrap.appendChild(b);
		}
	}

	function exhale() {
		// Skip while tab is hidden or the hero is scrolled out of view
		if (document.hidden || window.scrollY > window.innerHeight) return;
		var hr = bubbleWrap.getBoundingClientRect();
		var mr = maskFrame.getBoundingClientRect();
		var sideY = mr.bottom - hr.top - mr.height * 0.1;
		// Both sides of the mask
		spawnBubbles(mr.left - hr.left + mr.width * 0.07, sideY, 8 + Math.floor(Math.random() * 4), 9, 22);
		spawnBubbles(mr.left - hr.left + mr.width * 0.93, sideY, 8 + Math.floor(Math.random() * 4), 9, 22);
	}

	if (bubbleWrap && maskFrame && !prefersReducedMotion) {
		exhale();
		setInterval(exhale, 2000);
	}

	/* ---------- Typing effect (reveal-in-place: full text is laid out invisibly
	   from the first frame, so nothing ever shifts or rewraps while typing) ---------- */
	function typewriter(el, speed) {
		function wrapChars(node) {
			if (node.nodeType === 3) {
				var frag = document.createDocumentFragment();
				node.textContent.split("").forEach(function (ch) {
					var s = document.createElement("span");
					s.className = "tchar";
					s.style.visibility = "hidden";
					s.textContent = ch;
					frag.appendChild(s);
				});
				node.parentNode.replaceChild(frag, node);
			} else if (node.nodeType === 1) {
				Array.prototype.slice.call(node.childNodes).forEach(wrapChars);
			}
		}
		wrapChars(el);
		var chars = el.querySelectorAll(".tchar");
		var cursor = document.createElement("span");
		cursor.className = "typing-cursor";
		cursor.textContent = "|";
		var i = 0;
		(function reveal() {
			if (i >= chars.length) {
				cursor.remove();
				return;
			}
			var c = chars[i++];
			c.style.visibility = "visible";
			c.after(cursor);
			setTimeout(reveal, speed);
		})();
	}

	var t1 = document.getElementById("typing-text-1");
	if (t1 && !prefersReducedMotion) {
		typewriter(t1, 48);
	}

	/* ---------- Scroll reveals (staggered) ---------- */
	var revealObserver = new IntersectionObserver(function (entries) {
		entries.forEach(function (entry) {
			if (entry.isIntersecting) {
				entry.target.classList.add("in-view");
				revealObserver.unobserve(entry.target);
			}
		});
	}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

	// Single elements
	document.querySelectorAll("[data-reveal]").forEach(function (el) {
		el.classList.add("reveal");
		var dir = el.getAttribute("data-reveal");
		if (dir === "left") el.classList.add("from-left");
		if (dir === "right") el.classList.add("from-right");
		if (dir === "zoom") el.classList.add("zoom");
		revealObserver.observe(el);
	});

	// Containers whose children reveal with a stagger
	document.querySelectorAll("[data-reveal-children]").forEach(function (parent) {
		var step = parseFloat(parent.getAttribute("data-stagger") || "0.08");
		Array.prototype.forEach.call(parent.children, function (child, idx) {
			child.classList.add("reveal");
			child.style.setProperty("--reveal-delay", (idx % 12) * step + "s");
			revealObserver.observe(child);
		});
	});

	// Timeline rails draw themselves when visible
	document.querySelectorAll(".timeline").forEach(function (tl) {
		revealObserver.observe(tl);
	});

	/* ---------- Scrollspy ---------- */
	var sections = document.querySelectorAll("section[data-spy]");
	var linkById = {};
	navLinks.forEach(function (link) {
		var id = (link.getAttribute("href") || "").replace("#", "");
		if (id) linkById[id] = link;
	});

	var spyObserver = new IntersectionObserver(function (entries) {
		entries.forEach(function (entry) {
			if (entry.isIntersecting) {
				navLinks.forEach(function (l) { l.classList.remove("active"); });
				var link = linkById[entry.target.id];
				if (link) link.classList.add("active");
			}
		});
	}, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

	sections.forEach(function (s) { spyObserver.observe(s); });

	/* ---------- Work experience: show more / show less ---------- */
	var expToggle = document.getElementById("exp-toggle");
	if (expToggle) {
		expToggle.addEventListener("click", function () {
			var expanded = expToggle.getAttribute("aria-expanded") === "true";
			document.querySelectorAll("#work-timeline .t-extra").forEach(function (el) {
				el.classList.toggle("hidden-item", expanded);
			});
			expToggle.setAttribute("aria-expanded", expanded ? "false" : "true");
			expToggle.innerHTML = expanded
				? 'Show more <i class="fas fa-chevron-down"></i>'
				: 'Show less <i class="fas fa-chevron-up"></i>';
			// Keep the button in view when collapsing so the page doesn't jump
			if (expanded) expToggle.scrollIntoView({ block: "center", behavior: prefersReducedMotion ? "auto" : "smooth" });
		});
	}

	/* ---------- 3D tilt on project cards (pointer devices only) ---------- */
	if (!isTouch && !prefersReducedMotion) {
		document.querySelectorAll(".project-card").forEach(function (card) {
			var raf = null;

			card.addEventListener("pointermove", function (e) {
				if (raf) return;
				raf = window.requestAnimationFrame(function () {
					var r = card.getBoundingClientRect();
					var px = (e.clientX - r.left) / r.width - 0.5;
					var py = (e.clientY - r.top) / r.height - 0.5;
					card.style.transform =
						"perspective(900px) rotateX(" + (-py * 6).toFixed(2) + "deg) rotateY(" + (px * 8).toFixed(2) + "deg) translateY(-4px)";
					raf = null;
				});
			});

			card.addEventListener("pointerleave", function () {
				card.style.transform = "";
			});
		});
	}
})();
