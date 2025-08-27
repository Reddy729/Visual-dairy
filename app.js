(function() {
	const USERS_KEY = 'vd_users';
	const CURRENT_USER_KEY = 'vd_current_user';

	const form = document.getElementById('entry-form');
	const titleEl = document.getElementById('title');
	const notesEl = document.getElementById('notes');
	const imagesEl = document.getElementById('images');
	const entriesEl = document.getElementById('entries');
	const clearAllBtn = document.getElementById('clear-all');

	// View/Edit modal refs
	const viewModal = document.getElementById('view-modal');
	const viewClose = document.getElementById('view-close');
	const viewForm = document.getElementById('view-form');
	const viewId = document.getElementById('view-id');
	const viewTitle = document.getElementById('view-title');
	const viewNotes = document.getElementById('view-notes');
	const viewImages = document.getElementById('view-images');
	const viewThumbs = document.getElementById('view-thumbs');
	const viewDelete = document.getElementById('view-delete');

	// Auth UI
	const btnLogin = document.getElementById('btn-login');
	const btnLogout = document.getElementById('btn-logout');
	const userLabel = document.getElementById('user-label');
	const authModal = document.getElementById('auth-modal');
	const authClose = document.getElementById('auth-close');
	const authEmail = document.getElementById('auth-email');
	const authPassword = document.getElementById('auth-password');
	const authLogin = document.getElementById('auth-login');
	const authRegister = document.getElementById('auth-register');

	function storageKeyForEntries(userId) {
		return `vd_entries_${userId}`;
	}

	function loadEntries() {
		const user = getCurrentUser();
		if (!user) return [];
		try {
			return JSON.parse(localStorage.getItem(storageKeyForEntries(user.id)) || '[]');
		} catch (_) { return []; }
	}

	function saveEntries(entries) {
		const user = getCurrentUser();
		if (!user) return;
		localStorage.setItem(storageKeyForEntries(user.id), JSON.stringify(entries));
	}

	function formatDate(ts) {
		return new Date(ts).toLocaleString();
	}

	function safeRandomUUID() {
		if (window.crypto && typeof window.crypto.randomUUID === 'function') {
			try { return window.crypto.randomUUID(); } catch (_) {}
		}
		// Fallback UUID v4-ish
		const rnd = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).slice(1);
		return `${rnd()}${rnd()}-${rnd()}-${rnd()}-${rnd()}-${rnd()}${rnd()}${rnd()}`;
	}

	function createEntryCard(entry) {
		const div = document.createElement('div');
		div.className = 'card entry';
		div.dataset.id = entry.id;
		div.innerHTML = `
			<div class="date">${formatDate(entry.createdAt)}</div>
			<div class="title">${entry.title || 'Untitled'}</div>
			<div class="notes">${escapeHtml(entry.notes || '')}</div>
			<div class="thumbs"></div>
		`;
		const thumbs = div.querySelector('.thumbs');
		(entry.images || []).forEach(src => {
			const img = document.createElement('img');
			img.src = src;
			img.alt = 'image';
			thumbs.appendChild(img);
		});
		div.addEventListener('click', () => openView(entry.id));
		return div;
	}

	function render() {
		entriesEl.innerHTML = '';
		const entries = loadEntries();
		entries.forEach(e => entriesEl.appendChild(createEntryCard(e)));
	}

	function escapeHtml(str) {
		const div = document.createElement('div');
		div.innerText = str;
		return div.innerHTML.replace(/\n/g, '<br>');
	}

	function readFilesAsDataUrls(files) {
		const arr = Array.from(files || []);
		return Promise.all(arr.map(file => new Promise((resolve) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result);
			reader.readAsDataURL(file);
		})));
	}

	function openModal(el) { el.classList.remove('hidden'); }
	function closeModal(el) { el.classList.add('hidden'); }

	async function openView(id) {
		if (!getCurrentUser()) { openAuth(); return; }
		const entries = loadEntries();
		const entry = entries.find(e => e.id === id);
		if (!entry) return;
		viewId.value = entry.id;
		viewTitle.value = entry.title || '';
		viewNotes.value = entry.notes || '';
		viewImages.value = '';
		viewThumbs.innerHTML = '';
		(entry.images || []).forEach(src => {
			const img = document.createElement('img');
			img.src = src; img.alt = 'image';
			viewThumbs.appendChild(img);
		});
		openModal(viewModal);
	}

	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		if (!getCurrentUser()) { openAuth(); return; }
		const title = titleEl.value.trim();
		const notes = notesEl.value.trim();
		const images = await readFilesAsDataUrls(imagesEl.files);
		const entry = { id: safeRandomUUID(), createdAt: Date.now(), title, notes, images };
		const entries = loadEntries();
		entries.unshift(entry);
		saveEntries(entries);
		form.reset();
		render();
	});

	clearAllBtn.addEventListener('click', () => {
		if (confirm('Delete all diary entries?')) {
			const user = getCurrentUser();
			if (user) localStorage.removeItem(storageKeyForEntries(user.id));
			render();
		}
	});

	// View/Edit modal handlers
	viewClose.addEventListener('click', () => closeModal(viewModal));
	viewForm.addEventListener('submit', async (e) => {
		e.preventDefault();
		const id = viewId.value;
		const entries = loadEntries();
		const idx = entries.findIndex(e => e.id === id);
		if (idx === -1) return;
		const appendImgs = await readFilesAsDataUrls(viewImages.files);
		entries[idx] = {
			...entries[idx],
			title: viewTitle.value.trim(),
			notes: viewNotes.value.trim(),
			images: [...(entries[idx].images || []), ...appendImgs]
		};
		saveEntries(entries);
		closeModal(viewModal);
		render();
	});
	viewDelete.addEventListener('click', () => {
		if (!confirm('Delete this entry?')) return;
		const id = viewId.value;
		const entries = loadEntries().filter(e => e.id !== id);
		saveEntries(entries);
		closeModal(viewModal);
		render();
	});

	// Auth logic (localStorage with hashed password)
	function getUsersMap() {
		try { return JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); } catch (_) { return {}; }
	}
	function setUsersMap(map) { localStorage.setItem(USERS_KEY, JSON.stringify(map)); }
	function getCurrentUser() {
		try { return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null'); } catch (_) { return null; }
	}
	function setCurrentUser(user) {
		if (user) localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
		else localStorage.removeItem(CURRENT_USER_KEY);
		updateAuthUi();
		render();
	}

	async function sha256Hex(str) {
		try {
			if (window.isSecureContext && window.crypto && window.crypto.subtle) {
				const buf = new TextEncoder().encode(str);
				const digest = await window.crypto.subtle.digest('SHA-256', buf);
				return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
			}
		} catch (_) {}
		// Fallback: simple non-cryptographic hash (demo only)
		let h1 = 0x811c9dc5, h2 = 0x811c9dc5;
		for (let i = 0; i < str.length; i++) {
			const c = str.charCodeAt(i);
			h1 ^= c; h1 = (h1 * 0x01000193) >>> 0;
			h2 += c + ((h2 << 1) >>> 0); h2 >>>= 0;
		}
		const toHex = (n) => n.toString(16).padStart(8, '0');
		return `${toHex(h1)}${toHex(h2)}${toHex(h1 ^ h2)}${toHex((h1 * 31) >>> 0)}`;
	}

	async function register(email, password) {
		const users = getUsersMap();
		if (users[email]) throw new Error('User already exists');
		const passHash = await sha256Hex(password);
		users[email] = { id: email.toLowerCase(), email, passHash };
		setUsersMap(users);
		setCurrentUser({ id: email.toLowerCase(), email });
	}

	async function login(email, password) {
		const users = getUsersMap();
		const user = users[email];
		if (!user) throw new Error('User not found');
		const passHash = await sha256Hex(password);
		if (passHash !== user.passHash) throw new Error('Invalid password');
		setCurrentUser({ id: user.id, email: user.email });
	}

	function logout() { setCurrentUser(null); }

	function openAuth() { authModal.classList.remove('hidden'); }
	function closeAuth() { authModal.classList.add('hidden'); }

	function updateAuthUi() {
		const user = getCurrentUser();
		if (user) {
			userLabel.textContent = user.email;
			userLabel.classList.remove('hidden');
			btnLogin.classList.add('hidden');
			btnLogout.classList.remove('hidden');
			// enable form
			[titleEl, notesEl, imagesEl].forEach(el => el.disabled = false);
		} else {
			userLabel.textContent = '';
			userLabel.classList.add('hidden');
			btnLogin.classList.remove('hidden');
			btnLogout.classList.add('hidden');
			// disable form until login
			[titleEl, notesEl, imagesEl].forEach(el => el.disabled = true);
		}
	}

	btnLogin.addEventListener('click', openAuth);
	authClose.addEventListener('click', closeAuth);
	btnLogout.addEventListener('click', () => { logout(); });
	authLogin.addEventListener('click', async () => {
		try {
			await login(authEmail.value.trim().toLowerCase(), authPassword.value);
			closeAuth();
		} catch (e) { alert(e.message); }
	});
	authRegister.addEventListener('click', async () => {
		try {
			await register(authEmail.value.trim().toLowerCase(), authPassword.value);
			closeAuth();
		} catch (e) { alert(e.message); }
	});

	document.addEventListener('DOMContentLoaded', () => { updateAuthUi(); render(); });
})();


