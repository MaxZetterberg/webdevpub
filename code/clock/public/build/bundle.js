
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35730/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.1' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function cubicInOut(t) {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
    }
    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut } = {}) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }
    function draw(node, { delay = 0, speed, duration, easing = cubicInOut } = {}) {
        let len = node.getTotalLength();
        const style = getComputedStyle(node);
        if (style.strokeLinecap !== 'butt') {
            len += parseInt(style.strokeWidth);
        }
        if (duration === undefined) {
            if (speed === undefined) {
                duration = 800;
            }
            else {
                duration = len / speed;
            }
        }
        else if (typeof duration === 'function') {
            duration = duration(len);
        }
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `stroke-dasharray: ${t * len} ${u * len}`
        };
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function tick_spring(ctx, last_value, current_value, target_value) {
        if (typeof current_value === 'number' || is_date(current_value)) {
            // @ts-ignore
            const delta = target_value - current_value;
            // @ts-ignore
            const velocity = (current_value - last_value) / (ctx.dt || 1 / 60); // guard div by 0
            const spring = ctx.opts.stiffness * delta;
            const damper = ctx.opts.damping * velocity;
            const acceleration = (spring - damper) * ctx.inv_mass;
            const d = (velocity + acceleration) * ctx.dt;
            if (Math.abs(d) < ctx.opts.precision && Math.abs(delta) < ctx.opts.precision) {
                return target_value; // settled
            }
            else {
                ctx.settled = false; // signal loop to keep ticking
                // @ts-ignore
                return is_date(current_value) ?
                    new Date(current_value.getTime() + d) : current_value + d;
            }
        }
        else if (Array.isArray(current_value)) {
            // @ts-ignore
            return current_value.map((_, i) => tick_spring(ctx, last_value[i], current_value[i], target_value[i]));
        }
        else if (typeof current_value === 'object') {
            const next_value = {};
            for (const k in current_value) {
                // @ts-ignore
                next_value[k] = tick_spring(ctx, last_value[k], current_value[k], target_value[k]);
            }
            // @ts-ignore
            return next_value;
        }
        else {
            throw new Error(`Cannot spring ${typeof current_value} values`);
        }
    }
    function spring(value, opts = {}) {
        const store = writable(value);
        const { stiffness = 0.15, damping = 0.8, precision = 0.01 } = opts;
        let last_time;
        let task;
        let current_token;
        let last_value = value;
        let target_value = value;
        let inv_mass = 1;
        let inv_mass_recovery_rate = 0;
        let cancel_task = false;
        function set(new_value, opts = {}) {
            target_value = new_value;
            const token = current_token = {};
            if (value == null || opts.hard || (spring.stiffness >= 1 && spring.damping >= 1)) {
                cancel_task = true; // cancel any running animation
                last_time = now();
                last_value = new_value;
                store.set(value = target_value);
                return Promise.resolve();
            }
            else if (opts.soft) {
                const rate = opts.soft === true ? .5 : +opts.soft;
                inv_mass_recovery_rate = 1 / (rate * 60);
                inv_mass = 0; // infinite mass, unaffected by spring forces
            }
            if (!task) {
                last_time = now();
                cancel_task = false;
                task = loop(now => {
                    if (cancel_task) {
                        cancel_task = false;
                        task = null;
                        return false;
                    }
                    inv_mass = Math.min(inv_mass + inv_mass_recovery_rate, 1);
                    const ctx = {
                        inv_mass,
                        opts: spring,
                        settled: true,
                        dt: (now - last_time) * 60 / 1000
                    };
                    const next_value = tick_spring(ctx, last_value, value, target_value);
                    last_time = now;
                    last_value = value;
                    store.set(value = next_value);
                    if (ctx.settled) {
                        task = null;
                    }
                    return !ctx.settled;
                });
            }
            return new Promise(fulfil => {
                task.promise.then(() => {
                    if (token === current_token)
                        fulfil();
                });
            });
        }
        const spring = {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe,
            stiffness,
            damping,
            precision
        };
        return spring;
    }

    class Clock {
        constructor(hour,minute) {
            (hour >= 0 && hour < 24) ? this._hour = hour : console.log("Value must be between 0 and 24");
            (minute >= 0 && minute < 60) ? this._minute = minute : console.log("Value must be between 0 and 60");
            this.alarmIsActive = true;
            this.alarmIsTrigger = false;
            this.setAlarm(14, 0);
        }

        setAlarm(hour,minute) {
            this._hourAlarm = hour;
            this._minuteAlarm = minute;
        }

        set alarmFromString(string){
            this._hourAlarm = string.split(":")[0];
            this._minuteAlarm = string.split(":")[1];
            this.alarmIstrigger = false;
        }

        get alarmFromString(){
            return this.alarmTime;
        }

        activateAlarm() {
            this.alarmIsActive = true;
        }
        deactivateAlarm() {
            this.alarmIsActive = false;
        }

        toggleAlarm(){
            this.alarmIsTrigger = false;
        }



        get time(){
            return {"hour": this._hour.toString().padStart(2, "0"),
            "minute": this._minute.toString().padStart(2, "0")
            }
        }

        get alarmTime(){
            return this._hourAlarm.toString().padStart(2, '0') + ":" + this._minuteAlarm.toString().padStart(2, '0');
        }




        

        tick(){
            this._minute += 1;
            if(this._minute >= 60){
                this._minute = 0;
                this._hour += 1;
            }

            if(this._hour >= 24){
                this._hour = 0;
            }

            let timeHour = (this._hour < 10) ? "0" + this._hour : this._hour;
            let timeMinute = (this._minute < 10) ? "0" + this._minute : this._minute;
            console.log(timeHour + ":" + timeMinute);
            if(this.alarmIsActive && this._hour == this._hourAlarm && this._minute == this._minuteAlarm){
                console.log("Alarm!!!");
                this.alarmIsTrigger = true;
            }
        }



    }

    /* src\App.svelte generated by Svelte v3.44.1 */
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    // (43:4) {#each [1, 2, 3, 4] as offset}
    function create_each_block_1(ctx) {
    	let line;

    	const block = {
    		c: function create() {
    			line = svg_element("line");
    			attr_dev(line, "class", "minor svelte-1d673tb");
    			attr_dev(line, "y1", "42");
    			attr_dev(line, "y2", "45");
    			attr_dev(line, "transform", "rotate(" + 6 * (/*minute*/ ctx[9] + /*offset*/ ctx[12]) + ")");
    			add_location(line, file, 43, 5, 1264);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(43:4) {#each [1, 2, 3, 4] as offset}",
    		ctx
    	});

    	return block;
    }

    // (40:3) {#each [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] as minute}
    function create_each_block(ctx) {
    	let line;
    	let each_1_anchor;
    	let each_value_1 = [1, 2, 3, 4];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < 4; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			line = svg_element("line");

    			for (let i = 0; i < 4; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			attr_dev(line, "class", "major svelte-1d673tb");
    			attr_dev(line, "y1", "40");
    			attr_dev(line, "y2", "45");
    			attr_dev(line, "transform", "rotate(" + 30 * /*minute*/ ctx[9] + ")");
    			add_location(line, file, 40, 4, 1150);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);

    			for (let i = 0; i < 4; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(40:3) {#each [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] as minute}",
    		ctx
    	});

    	return block;
    }

    // (76:4) {:else}
    function create_else_block(ctx) {
    	let t0;
    	let t1_value = /*klocka*/ ctx[0].alarmTime + "";
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text("Alarm: ");
    			t1 = text(t1_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*klocka*/ 1 && t1_value !== (t1_value = /*klocka*/ ctx[0].alarmTime + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(76:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (74:4) {#if klocka.alarmIsTrigger == true}
    function create_if_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Vakna!!!");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(74:4) {#if klocka.alarmIsTrigger == true}",
    		ctx
    	});

    	return block;
    }

    // (82:4) {#key klocka.time.hour}
    function create_key_block_1(ctx) {
    	let span;
    	let t_value = /*klocka*/ ctx[0].time.hour.toString().padStart(2, "0") + "";
    	let t;
    	let span_intro;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "svelte-1d673tb");
    			add_location(span, file, 82, 5, 1881);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*klocka*/ 1 && t_value !== (t_value = /*klocka*/ ctx[0].time.hour.toString().padStart(2, "0") + "")) set_data_dev(t, t_value);
    		},
    		i: function intro(local) {
    			if (!span_intro) {
    				add_render_callback(() => {
    					span_intro = create_in_transition(span, fly, { y: -20 });
    					span_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block_1.name,
    		type: "key",
    		source: "(82:4) {#key klocka.time.hour}",
    		ctx
    	});

    	return block;
    }

    // (88:4) {#key klocka.time.minute}
    function create_key_block(ctx) {
    	let span;
    	let t_value = /*klocka*/ ctx[0].time.minute.toString().padStart(2, "0") + "";
    	let t;
    	let span_intro;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "svelte-1d673tb");
    			add_location(span, file, 88, 5, 2041);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*klocka*/ 1 && t_value !== (t_value = /*klocka*/ ctx[0].time.minute.toString().padStart(2, "0") + "")) set_data_dev(t, t_value);
    		},
    		i: function intro(local) {
    			if (!span_intro) {
    				add_render_callback(() => {
    					span_intro = create_in_transition(span, fly, { y: -20 });
    					span_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block.name,
    		type: "key",
    		source: "(88:4) {#key klocka.time.minute}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let body;
    	let div5;
    	let div0;
    	let cir;
    	let svg0;
    	let circle;
    	let line0;
    	let line0_transform_value;
    	let g;
    	let line1;
    	let g_transform_value;
    	let t0;
    	let div3;
    	let h3;
    	let t1;
    	let div2;
    	let previous_key = /*klocka*/ ctx[0].time.hour;
    	let t2;
    	let span;
    	let t4;
    	let previous_key_1 = /*klocka*/ ctx[0].time.minute;
    	let t5;
    	let div1;
    	let button;
    	let t7;
    	let input;
    	let t8;
    	let p0;
    	let t9;
    	let p1;
    	let t10;
    	let div4;
    	let rec;
    	let svg1;
    	let rect0;
    	let rect1;
    	let rect1_width_value;
    	let rect2;
    	let rect2_width_value;
    	let t11;
    	let p2;
    	let t12;
    	let p3;
    	let t13;
    	let p4;
    	let t14;
    	let p5;
    	let mounted;
    	let dispose;
    	let each_value = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < 12; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	function select_block_type(ctx, dirty) {
    		if (/*klocka*/ ctx[0].alarmIsTrigger == true) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);
    	let key_block0 = create_key_block_1(ctx);
    	let key_block1 = create_key_block(ctx);

    	const block = {
    		c: function create() {
    			body = element("body");
    			div5 = element("div");
    			div0 = element("div");
    			cir = element("cir");
    			svg0 = svg_element("svg");
    			circle = svg_element("circle");

    			for (let i = 0; i < 12; i += 1) {
    				each_blocks[i].c();
    			}

    			line0 = svg_element("line");
    			g = svg_element("g");
    			line1 = svg_element("line");
    			t0 = space();
    			div3 = element("div");
    			h3 = element("h3");
    			if_block.c();
    			t1 = space();
    			div2 = element("div");
    			key_block0.c();
    			t2 = space();
    			span = element("span");
    			span.textContent = ":";
    			t4 = space();
    			key_block1.c();
    			t5 = space();
    			div1 = element("div");
    			button = element("button");
    			button.textContent = "toggleAlarm";
    			t7 = space();
    			input = element("input");
    			t8 = space();
    			p0 = element("p");
    			t9 = space();
    			p1 = element("p");
    			t10 = space();
    			div4 = element("div");
    			rec = element("rec");
    			svg1 = svg_element("svg");
    			rect0 = svg_element("rect");
    			rect1 = svg_element("rect");
    			rect2 = svg_element("rect");
    			t11 = space();
    			p2 = element("p");
    			t12 = space();
    			p3 = element("p");
    			t13 = space();
    			p4 = element("p");
    			t14 = space();
    			p5 = element("p");
    			attr_dev(circle, "class", "clock-face svelte-1d673tb");
    			attr_dev(circle, "r", "48");
    			add_location(circle, file, 36, 6, 1020);
    			attr_dev(line0, "class", "hour svelte-1d673tb");
    			attr_dev(line0, "y1", "33");
    			attr_dev(line0, "y2", "38");
    			attr_dev(line0, "transform", line0_transform_value = "rotate(" + (6 / 12 * /*$minutes*/ ctx[3] - 180) + ")");
    			add_location(line0, file, 53, 3, 1425);
    			attr_dev(line1, "class", "minute svelte-1d673tb");
    			attr_dev(line1, "y1", "30");
    			attr_dev(line1, "y2", "38");
    			add_location(line1, file, 62, 4, 1607);
    			attr_dev(g, "transform", g_transform_value = "rotate(" + (6 * /*$minutes*/ ctx[3] - 180) + ")");
    			add_location(g, file, 61, 3, 1558);
    			attr_dev(svg0, "viewBox", "-50 -50 100 100");
    			attr_dev(svg0, "class", "svelte-1d673tb");
    			add_location(svg0, file, 35, 2, 982);
    			attr_dev(cir, "class", "svelte-1d673tb");
    			add_location(cir, file, 34, 2, 974);
    			attr_dev(div0, "class", "column svelte-1d673tb");
    			add_location(div0, file, 33, 1, 951);
    			add_location(h3, file, 72, 3, 1715);
    			attr_dev(span, "class", "svelte-1d673tb");
    			add_location(span, file, 86, 4, 1989);
    			attr_dev(button, "class", "button-3d svelte-1d673tb");
    			attr_dev(button, "id", "C-button2");
    			add_location(button, file, 93, 8, 2158);
    			attr_dev(input, "type", "time");
    			add_location(input, file, 94, 4, 2264);
    			add_location(div1, file, 93, 3, 2153);
    			attr_dev(p0, "id", "time");
    			attr_dev(p0, "class", "svelte-1d673tb");
    			add_location(p0, file, 95, 3, 2330);
    			attr_dev(p1, "id", "alarm");
    			attr_dev(p1, "class", "svelte-1d673tb");
    			add_location(p1, file, 96, 3, 2348);
    			add_location(div2, file, 80, 3, 1842);
    			attr_dev(div3, "class", "column svelte-1d673tb");
    			add_location(div3, file, 70, 2, 1689);
    			attr_dev(rect0, "width", "100%");
    			attr_dev(rect0, "height", "100%");
    			set_style(rect0, "fill", "rgb(79,79,79)");
    			set_style(rect0, "stroke-height", "1");
    			set_style(rect0, "stroke", "rgb(0,0,0)");
    			add_location(rect0, file, 106, 5, 2543);
    			attr_dev(rect1, "width", rect1_width_value = "" + (/*klocka*/ ctx[0].time.minute / 60 * 100 + "%"));
    			attr_dev(rect1, "height", "50%");
    			attr_dev(rect1, "style", "fill.rgb(0,0,0);stroke-height:1;stroke:rgb(0,0,0)");
    			add_location(rect1, file, 107, 5, 2645);
    			attr_dev(rect2, "width", rect2_width_value = "" + (/*klocka*/ ctx[0].time.minute / 60 + /*klocka*/ ctx[0].time.hour / 24 * 100 + "%"));
    			attr_dev(rect2, "height", "50%");
    			attr_dev(rect2, "y", "50%");
    			attr_dev(rect2, "style", "fill.rgb(0,0,0);stroke-height:1;stroke:rgb(0,0,0)");
    			add_location(rect2, file, 108, 5, 2772);
    			attr_dev(svg1, "width", "20");
    			attr_dev(svg1, "height", "10");
    			attr_dev(svg1, "class", "svelte-1d673tb");
    			add_location(svg1, file, 105, 4, 2509);
    			attr_dev(rec, "class", "svelte-1d673tb");
    			add_location(rec, file, 104, 3, 2499);
    			attr_dev(div4, "class", "column svelte-1d673tb");
    			add_location(div4, file, 103, 2, 2475);
    			attr_dev(p2, "id", "time");
    			attr_dev(p2, "class", "svelte-1d673tb");
    			add_location(p2, file, 115, 3, 2962);
    			attr_dev(p3, "id", "alarm");
    			attr_dev(p3, "class", "svelte-1d673tb");
    			add_location(p3, file, 117, 3, 2981);
    			attr_dev(p4, "id", "test");
    			attr_dev(p4, "class", "svelte-1d673tb");
    			add_location(p4, file, 119, 3, 3001);
    			attr_dev(p5, "class", "tjenix svelte-1d673tb");
    			add_location(p5, file, 123, 1, 3023);
    			attr_dev(div5, "class", "grid-container svelte-1d673tb");
    			add_location(div5, file, 32, 0, 920);
    			attr_dev(body, "class", "svelte-1d673tb");
    			add_location(body, file, 31, 0, 913);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, div5);
    			append_dev(div5, div0);
    			append_dev(div0, cir);
    			append_dev(cir, svg0);
    			append_dev(svg0, circle);

    			for (let i = 0; i < 12; i += 1) {
    				each_blocks[i].m(svg0, null);
    			}

    			append_dev(svg0, line0);
    			append_dev(svg0, g);
    			append_dev(g, line1);
    			append_dev(div5, t0);
    			append_dev(div5, div3);
    			append_dev(div3, h3);
    			if_block.m(h3, null);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			key_block0.m(div2, null);
    			append_dev(div2, t2);
    			append_dev(div2, span);
    			append_dev(div2, t4);
    			key_block1.m(div2, null);
    			append_dev(div2, t5);
    			append_dev(div2, div1);
    			append_dev(div1, button);
    			append_dev(div1, t7);
    			append_dev(div1, input);
    			set_input_value(input, /*klocka*/ ctx[0].alarmFromString);
    			append_dev(div2, t8);
    			append_dev(div2, p0);
    			append_dev(div2, t9);
    			append_dev(div2, p1);
    			append_dev(div5, t10);
    			append_dev(div5, div4);
    			append_dev(div4, rec);
    			append_dev(rec, svg1);
    			append_dev(svg1, rect0);
    			append_dev(svg1, rect1);
    			append_dev(svg1, rect2);
    			append_dev(div5, t11);
    			append_dev(div5, p2);
    			append_dev(div5, t12);
    			append_dev(div5, p3);
    			append_dev(div5, t13);
    			append_dev(div5, p4);
    			append_dev(div5, t14);
    			append_dev(div5, p5);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*click_handler*/ ctx[4], false, false, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[5])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$minutes*/ 8 && line0_transform_value !== (line0_transform_value = "rotate(" + (6 / 12 * /*$minutes*/ ctx[3] - 180) + ")")) {
    				attr_dev(line0, "transform", line0_transform_value);
    			}

    			if (dirty & /*$minutes*/ 8 && g_transform_value !== (g_transform_value = "rotate(" + (6 * /*$minutes*/ ctx[3] - 180) + ")")) {
    				attr_dev(g, "transform", g_transform_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(h3, null);
    				}
    			}

    			if (dirty & /*klocka*/ 1 && safe_not_equal(previous_key, previous_key = /*klocka*/ ctx[0].time.hour)) {
    				group_outros();
    				transition_out(key_block0, 1, 1, noop);
    				check_outros();
    				key_block0 = create_key_block_1(ctx);
    				key_block0.c();
    				transition_in(key_block0);
    				key_block0.m(div2, t2);
    			} else {
    				key_block0.p(ctx, dirty);
    			}

    			if (dirty & /*klocka*/ 1 && safe_not_equal(previous_key_1, previous_key_1 = /*klocka*/ ctx[0].time.minute)) {
    				group_outros();
    				transition_out(key_block1, 1, 1, noop);
    				check_outros();
    				key_block1 = create_key_block(ctx);
    				key_block1.c();
    				transition_in(key_block1);
    				key_block1.m(div2, t5);
    			} else {
    				key_block1.p(ctx, dirty);
    			}

    			if (dirty & /*klocka*/ 1) {
    				set_input_value(input, /*klocka*/ ctx[0].alarmFromString);
    			}

    			if (dirty & /*klocka*/ 1 && rect1_width_value !== (rect1_width_value = "" + (/*klocka*/ ctx[0].time.minute / 60 * 100 + "%"))) {
    				attr_dev(rect1, "width", rect1_width_value);
    			}

    			if (dirty & /*klocka*/ 1 && rect2_width_value !== (rect2_width_value = "" + (/*klocka*/ ctx[0].time.minute / 60 + /*klocka*/ ctx[0].time.hour / 24 * 100 + "%"))) {
    				attr_dev(rect2, "width", rect2_width_value);
    			}
    		},
    		i: function intro(local) {
    			transition_in(key_block0);
    			transition_in(key_block1);
    		},
    		o: function outro(local) {
    			transition_out(key_block0);
    			transition_out(key_block1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			destroy_each(each_blocks, detaching);
    			if_block.d();
    			key_block0.d(detaching);
    			key_block1.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $hours,
    		$$unsubscribe_hours = noop,
    		$$subscribe_hours = () => ($$unsubscribe_hours(), $$unsubscribe_hours = subscribe(hours, $$value => $$invalidate(7, $hours = $$value)), hours);

    	let $minutes,
    		$$unsubscribe_minutes = noop,
    		$$subscribe_minutes = () => ($$unsubscribe_minutes(), $$unsubscribe_minutes = subscribe(minutes, $$value => $$invalidate(3, $minutes = $$value)), minutes);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_hours());
    	$$self.$$.on_destroy.push(() => $$unsubscribe_minutes());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let klocka = new Clock(12, 57);
    	let minutes = spring();
    	validate_store(minutes, 'minutes');
    	$$subscribe_minutes();
    	let hours = spring();
    	validate_store(hours, 'hours');
    	$$subscribe_hours();
    	set_store_value(minutes, $minutes = parseInt(klocka.time.hour) * 60 + parseInt(klocka.time.minute), $minutes);
    	set_store_value(hours, $hours = parseInt(klocka.time.hour), $hours);
    	let i = 0;

    	function tick() {
    		klocka.tick();
    		$$invalidate(0, klocka);
    		i++;

    		if (klocka.time.hour + klocka.time.minute == 0) {
    			$$subscribe_hours($$invalidate(2, hours = spring()));
    			$$subscribe_minutes($$invalidate(1, minutes = spring()));
    			set_store_value(minutes, $minutes = parseInt(klocka.time.hour) * 60 + parseInt(klocka.time.minute), $minutes);
    			set_store_value(hours, $hours = parseInt(klocka.time.hour), $hours);
    		} else {
    			hours.set(parseInt(klocka.time.hour));
    			minutes.set(parseInt(klocka.time.hour) * 60 + parseInt(klocka.time.minute));
    		}
    	}

    	setInterval(tick, 1000);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => klocka.toggleAlarm();

    	function input_input_handler() {
    		klocka.alarmFromString = this.value;
    		$$invalidate(0, klocka);
    	}

    	$$self.$capture_state = () => ({
    		bind,
    		fly,
    		fade,
    		slide,
    		draw,
    		spring,
    		Clock,
    		klocka,
    		minutes,
    		hours,
    		i,
    		tick,
    		$hours,
    		$minutes
    	});

    	$$self.$inject_state = $$props => {
    		if ('klocka' in $$props) $$invalidate(0, klocka = $$props.klocka);
    		if ('minutes' in $$props) $$subscribe_minutes($$invalidate(1, minutes = $$props.minutes));
    		if ('hours' in $$props) $$subscribe_hours($$invalidate(2, hours = $$props.hours));
    		if ('i' in $$props) i = $$props.i;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [klocka, minutes, hours, $minutes, click_handler, input_input_handler];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
