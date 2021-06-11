import {getCategories, getDomains, saveCategories, saveDomains} from "./storage";
import {DataTable} from "simple-datatables"
import jQuery from 'jquery';
import f from "@fonticonpicker/fonticonpicker";



function getElementById(id) {
	return document.getElementById(id);
}

function getElementsByClassName(className) {
	return document.getElementsByClassName(className);
}

function getActionButtonForDomain(domain) {
	return  `<div>
				<button data-domain-name="${domain.domain}" data-domain-category="${domain.category}" class="btn btn-light edit-domain"
				 data-bs-toggle="modal" data-bs-target="#edit-domain-modal">
				 	<i class="fa fa-pencil-alt"></i>
				 </button>
				<button data-domain-name="${domain.domain}" data-domain-category="${domain.category}" class="btn btn-light delete-domain"
				data-bs-toggle="modal" data-bs-target="#delete-domain-modal">
					<i class="fa fa-trash"></i>
				</button>
			</div>`
}

function getActionButtonForCategory(category) {
	return  `<div>
				<button data-category-name="${category.name}" data-category-color="${category.color}" data-category-icon="${category.icon}" class="btn btn-light edit-category"
				 data-bs-toggle="modal" data-bs-target="#edit-category-modal">
					<i class="fa fa-pencil-alt"></i>
				</button>
			 	<button data-category-name="${category.name}" data-category-color="${category.color}" data-category-icon="${category.icon}" class="btn btn-light delete-category"
				 data-bs-toggle="modal" data-bs-target="#delete-category-modal">
					<i class="fa fa-trash"></i>
				</button>
			 </div>`
}

function addCategorySelectOptions() {
	getCategories().then(categories => {
		const selectList = [...getElementsByClassName('category-select')];
		selectList.forEach((select) => {
			select.innerHTML = '';
			for(let category of categories) {
				let option = document.createElement('option');
				option.appendChild( document.createTextNode(category.name) );
				option.value = category.name;
				select.appendChild(option);
			}
		})
	})
}

function getDomainDataFor(action) {
	let data = {
		domain: getElementById(`domain-to-${action}`).value,
		category: getElementById(`${action}-domain-category-select`).value,
		enabled: true
	}

	if(action === 'edit') {
		data['oldDomain'] = getElementById(`domain-to-${action}`).getAttribute('data-old-domain');
	}

	return data;
}

function resetDomainsModalFor(action) {
	getElementById(`domain-to-${action}`).value = '';
	getElementById(`${action}-domain-category-select`).value = '';
}


function setDomainDataToModalFor(action, data) {
	getElementById(`domain-to-${action}`).value = data.domain;
	getElementById(`domain-to-${action}`).setAttribute('data-old-domain',  data.domain);
	getElementById(`${action}-domain-category-select`).value = data.category;
}

function getCategoryDataFor(action) {
	let data = {
		name: getElementById(`${action}-category-name`).value,
		color: getElementById(`${action}-category-color`).value,
		icon: getElementById(`${action}-category-icon`).value,
		enabled: true
	}

	if(action === 'edit') {
		data['oldCategoryName'] = getElementById(`${action}-category-name`).getAttribute('data-old-category-name');
	}

	return data;
}

function setCategoryDataToModalFor(action, data) {
	getElementById(`${action}-category-name`).value = data.name;
	getElementById(`${action}-category-name`).setAttribute('data-old-category-name',  data.name);
	getElementById(`${action}-category-color`).value = data.color;
	getElementById(`${action}-category-icon`).value = data.icon;
}

function resetCategoryModalFor(action) {
	getElementById(`${action}-category-name`).value = '';
	getElementById(`${action}-category-color`).value = '';
	getElementById(`${action}-category-icon`).value = '';
}

function createDomainsTable() {
	const table = new DataTable(".domains-table", {
		data: {
			headings: ["Domains", "Category", "Enabled", "Actions"],
			data: []
		},
	})
	return function () {
		getDomains().then(domains => {
			if (!domains.length) {
				table.rows().remove('all');
			}
			const newData = {
				headings: ["Domains", "Category", "Enabled", "Actions"],
				data: domains.map(domain => {
					let rowData = Object.values(domain);
					rowData.push(getActionButtonForDomain(domain));
					return rowData;
				})
			}
			table.rows().remove('all');
			table.insert(newData);
			addDomainsActionButtonsEventListener();
		});
	}
}

function createCategoriesTable() {
	const table = new DataTable(".categories-table", {
		data: {
			headings: ["Name", "Color", "Icon", "Enabled", "Actions"],
			data: []
		},
	})
	return function () {
		getCategories().then(categories => {
			if (!categories.length) {
				table.rows().remove('all');
			}
			const newData = {
				headings: ["Name", "Color", "Icon", "Enabled", "Actions"],
				data: categories.map(category => {
					let rowData = Object.values(category);
					rowData.push(getActionButtonForCategory(category));
					return rowData;
				})
			}
			table.rows().remove('all');
			table.insert(newData);
			addCategoriesActionButtonsEventListener();
		});
	}
}

function showDomainAlreadyExistsError(domain) {
	const error = document.createTextNode(`The domain: ${domain.domain} is already blocked!`);
	document.querySelector("#error-container").appendChild(error);
}

function showCategoryAlreadyExistsError(category) {
	const error = document.createTextNode(`The category: ${category.name} already exists!`);
	document.querySelector("#error-container").appendChild(error);
}

const updateDomainsTable = createDomainsTable();
const updateCategoriesTable = createCategoriesTable();

function createNewDomain(domainData) {
	getDomains().then((domains) => {
		domains.map((domain) => domain.domain).includes(domainData.domain) ?
			showDomainAlreadyExistsError(domainData):
			domains.push(domainData);

		saveDomains(domains).then(() => {
			updateDomainsTable();
			resetDomainsModalFor('add');
		});
	})
}

function editDomain(domainData) {
	getDomains().then((domains) => {
		domains = domains.filter((domain) => domain.domain !== domainData.oldDomain)
		delete domainData.oldDomain;
		domains.push(domainData);

		saveDomains(domains).then(() => {
			updateDomainsTable();
			resetDomainsModalFor('edit');
		});
	})
}

function deleteDomain(domainData) {
	getDomains().then((domains) => {
		console.log(domains)
		domains = domains.filter((domain) => domain.domain !== domainData.domain)
		console.log(domains)

		saveDomains(domains).then(() => {
			updateDomainsTable();
			resetDomainsModalFor('delete');
		});
	})
}

function createNewCategory(categoryData) {
	getCategories().then((categories) => {
		categories.map((category) => category.name).includes(categoryData.name) ?
			showCategoryAlreadyExistsError(categoryData):
			categories.push(categoryData);

		saveCategories(categories).then(() => {
			updateCategoriesTable();
			addCategorySelectOptions();
			resetCategoryModalFor('add');
		});
	})
}

function editCategory(categoryData) {
	getCategories().then((categories) => {
		categories = categories.filter((category) => category.name !== categoryData.oldCategoryName)
		categories.push(categoryData);

		saveCategories(categories).then(() => {
			updateCategoriesTable();
			addCategorySelectOptions();
			resetCategoryModalFor('edit');
		});
	})
}

function deleteCategory(categoryData) {
	getCategories().then((categories) => {
		console.log(categories, categoryData)
		categories = categories.filter((category) => category.name !== categoryData.name)
		console.log(categories, categoryData)

		saveCategories(categories).then(() => {
			updateCategoriesTable();
			resetCategoryModalFor('delete');
		});
	})
}

function addDomainsActionButtonsEventListener() {
	[...getElementsByClassName("edit-domain")].forEach( element => {
		element.addEventListener("click", (e) => {
			const target = e.target.tagName === 'BUTTON' ? e.target : e.target.parentNode;
			const domainData = {
				domain: target.getAttribute('data-domain-name'),
				category: target.getAttribute('data-domain-category')
			}
			setDomainDataToModalFor('edit', domainData);
		});
	});
	[...getElementsByClassName("delete-domain")].forEach( element => {
		element.addEventListener("click", (e) => {
			const target = e.target.tagName === 'BUTTON' ? e.target : e.target.parentNode;
			const domainData = {
				domain: target.getAttribute('data-domain-name'),
				category: target.getAttribute('data-domain-category')
			}
			console.log(target, domainData)
			setDomainDataToModalFor('delete', domainData);
		});
	});
}

function addCategoriesActionButtonsEventListener() {
	[...getElementsByClassName("edit-category")].forEach( element => {
		element.addEventListener("click", (e) => {
			const target = e.target.tagName === 'BUTTON' ? e.target : e.target.parentNode;
			const categoryData = {
				name: target.getAttribute('data-category-name'),
				color: target.getAttribute('data-category-color'),
				icon: target.getAttribute('data-category-icon'),
			}
			setCategoryDataToModalFor('edit', categoryData);
		});
	});
	[...getElementsByClassName("delete-category")].forEach( element => {
		element.addEventListener("click", (e) => {
			const target = e.target.tagName === 'BUTTON' ? e.target : e.target.parentNode;
			const categoryData = {
				name: target.getAttribute('data-category-name'),
				color: target.getAttribute('data-category-color'),
				icon: target.getAttribute('data-category-icon'),
			}
			setCategoryDataToModalFor('delete', categoryData);
		});
	});
}

function updateTables() {
	updateDomainsTable();
	updateCategoriesTable();
}

updateTables()

addCategorySelectOptions();

getElementById("save-domain").addEventListener("click", (e) => {
	const domainData = getDomainDataFor('add');
	createNewDomain(domainData)
});

getElementById("save-edited-domain").addEventListener("click", (e) => {
	const domainData = getDomainDataFor('edit');
	editDomain(domainData)
});

getElementById("delete-domain").addEventListener("click", (e) => {
	const domainData = getDomainDataFor('delete');
	deleteDomain(domainData)
});

getElementById("save-category").addEventListener("click", (e) => {
	const categoryData = getCategoryDataFor('add');
	createNewCategory(categoryData)
});


getElementById("save-edited-category").addEventListener("click", (e) => {
	const categoryData = getCategoryDataFor('edit');
	editCategory(categoryData)
});

getElementById("delete-category").addEventListener("click", (e) => {
	const categoryData = getCategoryDataFor('delete');
	deleteCategory(categoryData)
});

f(jQuery);

let icons = {
	"Accessibility": [
		"fab fa-accessible-icon",
		"fas fa-american-sign-language-interpreting",
		"fas fa-assistive-listening-systems",
		"fas fa-audio-description",
		"fas fa-blind",
		"fas fa-braille",
		"fas fa-closed-captioning",
		"far fa-closed-captioning",
		"fas fa-deaf",
		"fas fa-low-vision",
		"fas fa-phone-volume",
		"fas fa-question-circle",
		"far fa-question-circle",
		"fas fa-sign-language",
		"fas fa-tty",
		"fas fa-universal-access",
		"fas fa-wheelchair"
	],
	"Arrows": [
		"fas fa-angle-double-down",
		"fas fa-angle-double-left",
		"fas fa-angle-double-right",
		"fas fa-angle-double-up",
		"fas fa-angle-down",
		"fas fa-angle-left",
		"fas fa-angle-right",
		"fas fa-angle-up",
		"fas fa-arrow-alt-circle-down",
		"far fa-arrow-alt-circle-down",
		"fas fa-arrow-alt-circle-left",
		"far fa-arrow-alt-circle-left",
		"fas fa-arrow-alt-circle-right",
		"far fa-arrow-alt-circle-right",
		"fas fa-arrow-alt-circle-up",
		"far fa-arrow-alt-circle-up",
		"fas fa-arrow-circle-down",
		"fas fa-arrow-circle-left",
		"fas fa-arrow-circle-right",
		"fas fa-arrow-circle-up",
		"fas fa-arrow-down",
		"fas fa-arrow-left",
		"fas fa-arrow-right",
		"fas fa-arrow-up",
		"fas fa-arrows-alt",
		"fas fa-arrows-alt-h",
		"fas fa-arrows-alt-v",
		"fas fa-caret-down",
		"fas fa-caret-left",
		"fas fa-caret-right",
		"fas fa-caret-square-down",
		"far fa-caret-square-down",
		"fas fa-caret-square-left",
		"far fa-caret-square-left",
		"fas fa-caret-square-right",
		"far fa-caret-square-right",
		"fas fa-caret-square-up",
		"far fa-caret-square-up",
		"fas fa-caret-up",
		"fas fa-cart-arrow-down",
		"fas fa-chart-line",
		"fas fa-chevron-circle-down",
		"fas fa-chevron-circle-left",
		"fas fa-chevron-circle-right",
		"fas fa-chevron-circle-up",
		"fas fa-chevron-down",
		"fas fa-chevron-left",
		"fas fa-chevron-right",
		"fas fa-chevron-up",
		"fas fa-cloud-download-alt",
		"fas fa-cloud-upload-alt",
		"fas fa-download",
		"fas fa-exchange-alt",
		"fas fa-expand-arrows-alt",
		"fas fa-external-link-alt",
		"fas fa-external-link-square-alt",
		"fas fa-hand-point-down",
		"far fa-hand-point-down",
		"fas fa-hand-point-left",
		"far fa-hand-point-left",
		"fas fa-hand-point-right",
		"far fa-hand-point-right",
		"fas fa-hand-point-up",
		"far fa-hand-point-up",
		"fas fa-hand-pointer",
		"far fa-hand-pointer",
		"fas fa-history",
		"fas fa-level-down-alt",
		"fas fa-level-up-alt",
		"fas fa-location-arrow",
		"fas fa-long-arrow-alt-down",
		"fas fa-long-arrow-alt-left",
		"fas fa-long-arrow-alt-right",
		"fas fa-long-arrow-alt-up",
		"fas fa-mouse-pointer",
		"fas fa-play",
		"fas fa-random",
		"fas fa-recycle",
		"fas fa-redo",
		"fas fa-redo-alt",
		"fas fa-reply",
		"fas fa-reply-all",
		"fas fa-retweet",
		"fas fa-share",
		"fas fa-share-square",
		"far fa-share-square",
		"fas fa-sign-in-alt",
		"fas fa-sign-out-alt",
		"fas fa-sort",
		"fas fa-sort-alpha-down",
		"fas fa-sort-alpha-up",
		"fas fa-sort-amount-down",
		"fas fa-sort-amount-up",
		"fas fa-sort-down",
		"fas fa-sort-numeric-down",
		"fas fa-sort-numeric-up",
		"fas fa-sort-up",
		"fas fa-sync",
		"fas fa-sync-alt",
		"fas fa-text-height",
		"fas fa-text-width",
		"fas fa-undo",
		"fas fa-undo-alt",
		"fas fa-upload"
	],
	"Audio & Video": [
		"fas fa-audio-description",
		"fas fa-backward",
		"fas fa-circle",
		"far fa-circle",
		"fas fa-closed-captioning",
		"far fa-closed-captioning",
		"fas fa-compress",
		"fas fa-eject",
		"fas fa-expand",
		"fas fa-expand-arrows-alt",
		"fas fa-fast-backward",
		"fas fa-fast-forward",
		"fas fa-file-audio",
		"far fa-file-audio",
		"fas fa-file-video",
		"far fa-file-video",
		"fas fa-film",
		"fas fa-forward",
		"fas fa-headphones",
		"fas fa-microphone",
		"fas fa-microphone-slash",
		"fas fa-music",
		"fas fa-pause",
		"fas fa-pause-circle",
		"far fa-pause-circle",
		"fas fa-phone-volume",
		"fas fa-play",
		"fas fa-play-circle",
		"far fa-play-circle",
		"fas fa-podcast",
		"fas fa-random",
		"fas fa-redo",
		"fas fa-redo-alt",
		"fas fa-rss",
		"fas fa-rss-square",
		"fas fa-step-backward",
		"fas fa-step-forward",
		"fas fa-stop",
		"fas fa-stop-circle",
		"far fa-stop-circle",
		"fas fa-sync",
		"fas fa-sync-alt",
		"fas fa-undo",
		"fas fa-undo-alt",
		"fas fa-video",
		"fas fa-volume-down",
		"fas fa-volume-off",
		"fas fa-volume-up",
		"fab fa-youtube"
	],
	"Business": [
		"fas fa-address-book",
		"far fa-address-book",
		"fas fa-address-card",
		"far fa-address-card",
		"fas fa-archive",
		"fas fa-balance-scale",
		"fas fa-birthday-cake",
		"fas fa-book",
		"fas fa-briefcase",
		"fas fa-building",
		"far fa-building",
		"fas fa-bullhorn",
		"fas fa-bullseye",
		"fas fa-calculator",
		"fas fa-calendar",
		"far fa-calendar",
		"fas fa-calendar-alt",
		"far fa-calendar-alt",
		"fas fa-certificate",
		"fas fa-chart-area",
		"fas fa-chart-bar",
		"far fa-chart-bar",
		"fas fa-chart-line",
		"fas fa-chart-pie",
		"fas fa-clipboard",
		"far fa-clipboard",
		"fas fa-coffee",
		"fas fa-columns",
		"fas fa-compass",
		"far fa-compass",
		"fas fa-copy",
		"far fa-copy",
		"fas fa-copyright",
		"far fa-copyright",
		"fas fa-cut",
		"fas fa-edit",
		"far fa-edit",
		"fas fa-envelope",
		"far fa-envelope",
		"fas fa-envelope-open",
		"far fa-envelope-open",
		"fas fa-envelope-square",
		"fas fa-eraser",
		"fas fa-fax",
		"fas fa-file",
		"far fa-file",
		"fas fa-file-alt",
		"far fa-file-alt",
		"fas fa-folder",
		"far fa-folder",
		"fas fa-folder-open",
		"far fa-folder-open",
		"fas fa-globe",
		"fas fa-industry",
		"fas fa-paperclip",
		"fas fa-paste",
		"fas fa-pen-square",
		"fas fa-pencil-alt",
		"fas fa-percent",
		"fas fa-phone",
		"fas fa-phone-square",
		"fas fa-phone-volume",
		"fas fa-registered",
		"far fa-registered",
		"fas fa-save",
		"far fa-save",
		"fas fa-sitemap",
		"fas fa-sticky-note",
		"far fa-sticky-note",
		"fas fa-suitcase",
		"fas fa-table",
		"fas fa-tag",
		"fas fa-tags",
		"fas fa-tasks",
		"fas fa-thumbtack",
		"fas fa-trademark"
	],
	"Chess": [
		"fas fa-chess",
		"fas fa-chess-bishop",
		"fas fa-chess-board",
		"fas fa-chess-king",
		"fas fa-chess-knight",
		"fas fa-chess-pawn",
		"fas fa-chess-queen",
		"fas fa-chess-rook",
		"fas fa-square-full"
	],
	"Code": [
		"fas fa-archive",
		"fas fa-barcode",
		"fas fa-bath",
		"fas fa-bug",
		"fas fa-code",
		"fas fa-code-branch",
		"fas fa-coffee",
		"fas fa-file",
		"far fa-file",
		"fas fa-file-alt",
		"far fa-file-alt",
		"fas fa-file-code",
		"far fa-file-code",
		"fas fa-filter",
		"fas fa-fire-extinguisher",
		"fas fa-folder",
		"far fa-folder",
		"fas fa-folder-open",
		"far fa-folder-open",
		"fas fa-keyboard",
		"far fa-keyboard",
		"fas fa-microchip",
		"fas fa-qrcode",
		"fas fa-shield-alt",
		"fas fa-sitemap",
		"fas fa-terminal",
		"fas fa-user-secret",
		"fas fa-window-close",
		"far fa-window-close",
		"fas fa-window-maximize",
		"far fa-window-maximize",
		"fas fa-window-minimize",
		"far fa-window-minimize",
		"fas fa-window-restore",
		"far fa-window-restore"
	],
	"Communication": [
		"fas fa-address-book",
		"far fa-address-book",
		"fas fa-address-card",
		"far fa-address-card",
		"fas fa-american-sign-language-interpreting",
		"fas fa-assistive-listening-systems",
		"fas fa-at",
		"fas fa-bell",
		"far fa-bell",
		"fas fa-bell-slash",
		"far fa-bell-slash",
		"fab fa-bluetooth",
		"fab fa-bluetooth-b",
		"fas fa-bullhorn",
		"fas fa-comment",
		"far fa-comment",
		"fas fa-comment-alt",
		"far fa-comment-alt",
		"fas fa-comments",
		"far fa-comments",
		"fas fa-envelope",
		"far fa-envelope",
		"fas fa-envelope-open",
		"far fa-envelope-open",
		"fas fa-envelope-square",
		"fas fa-fax",
		"fas fa-inbox",
		"fas fa-language",
		"fas fa-microphone",
		"fas fa-microphone-slash",
		"fas fa-mobile",
		"fas fa-mobile-alt",
		"fas fa-paper-plane",
		"far fa-paper-plane",
		"fas fa-phone",
		"fas fa-phone-square",
		"fas fa-phone-volume",
		"fas fa-rss",
		"fas fa-rss-square",
		"fas fa-tty",
		"fas fa-wifi"
	],
	"Computers": [
		"fas fa-desktop",
		"fas fa-download",
		"fas fa-hdd",
		"far fa-hdd",
		"fas fa-headphones",
		"fas fa-keyboard",
		"far fa-keyboard",
		"fas fa-laptop",
		"fas fa-microchip",
		"fas fa-mobile",
		"fas fa-mobile-alt",
		"fas fa-plug",
		"fas fa-power-off",
		"fas fa-print",
		"fas fa-save",
		"far fa-save",
		"fas fa-server",
		"fas fa-tablet",
		"fas fa-tablet-alt",
		"fas fa-tv",
		"fas fa-upload"
	],
	"Currency": [
		"fab fa-bitcoin",
		"fab fa-btc",
		"fas fa-dollar-sign",
		"fas fa-euro-sign",
		"fab fa-gg",
		"fab fa-gg-circle",
		"fas fa-lira-sign",
		"fas fa-money-bill-alt",
		"far fa-money-bill-alt",
		"fas fa-pound-sign",
		"fas fa-ruble-sign",
		"fas fa-rupee-sign",
		"fas fa-shekel-sign",
		"fas fa-won-sign",
		"fas fa-yen-sign"
	],
	"Date & Time": [
		"fas fa-bell",
		"far fa-bell",
		"fas fa-bell-slash",
		"far fa-bell-slash",
		"fas fa-calendar",
		"far fa-calendar",
		"fas fa-calendar-alt",
		"far fa-calendar-alt",
		"fas fa-calendar-check",
		"far fa-calendar-check",
		"fas fa-calendar-minus",
		"far fa-calendar-minus",
		"fas fa-calendar-plus",
		"far fa-calendar-plus",
		"fas fa-calendar-times",
		"far fa-calendar-times",
		"fas fa-clock",
		"far fa-clock",
		"fas fa-hourglass",
		"far fa-hourglass",
		"fas fa-hourglass-end",
		"fas fa-hourglass-half",
		"fas fa-hourglass-start",
		"fas fa-stopwatch"
	],
	"Design": [
		"fas fa-adjust",
		"fas fa-clone",
		"far fa-clone",
		"fas fa-copy",
		"far fa-copy",
		"fas fa-crop",
		"fas fa-crosshairs",
		"fas fa-cut",
		"fas fa-edit",
		"far fa-edit",
		"fas fa-eraser",
		"fas fa-eye",
		"fas fa-eye-dropper",
		"fas fa-eye-slash",
		"far fa-eye-slash",
		"fas fa-object-group",
		"far fa-object-group",
		"fas fa-object-ungroup",
		"far fa-object-ungroup",
		"fas fa-paint-brush",
		"fas fa-paste",
		"fas fa-pencil-alt",
		"fas fa-save",
		"far fa-save",
		"fas fa-tint"
	],
	"Editors": [
		"fas fa-align-center",
		"fas fa-align-justify",
		"fas fa-align-left",
		"fas fa-align-right",
		"fas fa-bold",
		"fas fa-clipboard",
		"far fa-clipboard",
		"fas fa-clone",
		"far fa-clone",
		"fas fa-columns",
		"fas fa-copy",
		"far fa-copy",
		"fas fa-cut",
		"fas fa-edit",
		"far fa-edit",
		"fas fa-eraser",
		"fas fa-file",
		"far fa-file",
		"fas fa-file-alt",
		"far fa-file-alt",
		"fas fa-font",
		"fas fa-heading",
		"fas fa-i-cursor",
		"fas fa-indent",
		"fas fa-italic",
		"fas fa-link",
		"fas fa-list",
		"fas fa-list-alt",
		"far fa-list-alt",
		"fas fa-list-ol",
		"fas fa-list-ul",
		"fas fa-outdent",
		"fas fa-paper-plane",
		"far fa-paper-plane",
		"fas fa-paperclip",
		"fas fa-paragraph",
		"fas fa-paste",
		"fas fa-pencil-alt",
		"fas fa-print",
		"fas fa-quote-left",
		"fas fa-quote-right",
		"fas fa-redo",
		"fas fa-redo-alt",
		"fas fa-reply",
		"fas fa-reply-all",
		"fas fa-share",
		"fas fa-strikethrough",
		"fas fa-subscript",
		"fas fa-superscript",
		"fas fa-sync",
		"fas fa-sync-alt",
		"fas fa-table",
		"fas fa-tasks",
		"fas fa-text-height",
		"fas fa-text-width",
		"fas fa-th",
		"fas fa-th-large",
		"fas fa-th-list",
		"fas fa-trash",
		"fas fa-trash-alt",
		"far fa-trash-alt",
		"fas fa-underline",
		"fas fa-undo",
		"fas fa-undo-alt",
		"fas fa-unlink"
	],
	"Files": [
		"fas fa-archive",
		"fas fa-clone",
		"far fa-clone",
		"fas fa-copy",
		"far fa-copy",
		"fas fa-cut",
		"fas fa-file",
		"far fa-file",
		"fas fa-file-alt",
		"far fa-file-alt",
		"fas fa-file-archive",
		"far fa-file-archive",
		"fas fa-file-audio",
		"far fa-file-audio",
		"fas fa-file-code",
		"far fa-file-code",
		"fas fa-file-excel",
		"far fa-file-excel",
		"fas fa-file-image",
		"far fa-file-image",
		"fas fa-file-pdf",
		"far fa-file-pdf",
		"fas fa-file-powerpoint",
		"far fa-file-powerpoint",
		"fas fa-file-video",
		"far fa-file-video",
		"fas fa-file-word",
		"far fa-file-word",
		"fas fa-folder",
		"far fa-folder",
		"fas fa-folder-open",
		"far fa-folder-open",
		"fas fa-paste",
		"fas fa-save",
		"far fa-save",
		"fas fa-sticky-note",
		"far fa-sticky-note"
	],
	"Genders": [
		"fas fa-genderless",
		"fas fa-mars",
		"fas fa-mars-double",
		"fas fa-mars-stroke",
		"fas fa-mars-stroke-h",
		"fas fa-mars-stroke-v",
		"fas fa-mercury",
		"fas fa-neuter",
		"fas fa-transgender",
		"fas fa-transgender-alt",
		"fas fa-venus",
		"fas fa-venus-double",
		"fas fa-venus-mars"
	],
	"Hands": [
		"fas fa-hand-lizard",
		"far fa-hand-lizard",
		"fas fa-hand-paper",
		"far fa-hand-paper",
		"fas fa-hand-peace",
		"far fa-hand-peace",
		"fas fa-hand-point-down",
		"far fa-hand-point-down",
		"fas fa-hand-point-left",
		"far fa-hand-point-left",
		"fas fa-hand-point-right",
		"far fa-hand-point-right",
		"fas fa-hand-point-up",
		"far fa-hand-point-up",
		"fas fa-hand-pointer",
		"far fa-hand-pointer",
		"fas fa-hand-rock",
		"far fa-hand-rock",
		"fas fa-hand-scissors",
		"far fa-hand-scissors",
		"fas fa-hand-spock",
		"far fa-hand-spock",
		"fas fa-handshake",
		"far fa-handshake",
		"fas fa-thumbs-down",
		"far fa-thumbs-down",
		"fas fa-thumbs-up",
		"far fa-thumbs-up"
	],
	"Health": [
		"fab fa-accessible-icon",
		"fas fa-ambulance",
		"fas fa-h-square",
		"fas fa-heart",
		"far fa-heart",
		"fas fa-heartbeat",
		"fas fa-hospital",
		"far fa-hospital",
		"fas fa-medkit",
		"fas fa-plus-square",
		"far fa-plus-square",
		"fas fa-stethoscope",
		"fas fa-user-md",
		"fas fa-wheelchair"
	],
	"Images": [
		"fas fa-adjust",
		"fas fa-bolt",
		"fas fa-camera",
		"fas fa-camera-retro",
		"fas fa-clone",
		"far fa-clone",
		"fas fa-compress",
		"fas fa-expand",
		"fas fa-eye",
		"fas fa-eye-dropper",
		"fas fa-eye-slash",
		"far fa-eye-slash",
		"fas fa-file-image",
		"far fa-file-image",
		"fas fa-film",
		"fas fa-id-badge",
		"far fa-id-badge",
		"fas fa-id-card",
		"far fa-id-card",
		"fas fa-image",
		"far fa-image",
		"fas fa-images",
		"far fa-images",
		"fas fa-sliders-h",
		"fas fa-tint"
	],
	"Interfaces": [
		"fas fa-ban",
		"fas fa-barcode",
		"fas fa-bars",
		"fas fa-beer",
		"fas fa-bell",
		"far fa-bell",
		"fas fa-bell-slash",
		"far fa-bell-slash",
		"fas fa-bug",
		"fas fa-bullhorn",
		"fas fa-bullseye",
		"fas fa-calculator",
		"fas fa-calendar",
		"far fa-calendar",
		"fas fa-calendar-alt",
		"far fa-calendar-alt",
		"fas fa-calendar-check",
		"far fa-calendar-check",
		"fas fa-calendar-minus",
		"far fa-calendar-minus",
		"fas fa-calendar-plus",
		"far fa-calendar-plus",
		"fas fa-calendar-times",
		"far fa-calendar-times",
		"fas fa-certificate",
		"fas fa-check",
		"fas fa-check-circle",
		"far fa-check-circle",
		"fas fa-check-square",
		"far fa-check-square",
		"fas fa-circle",
		"far fa-circle",
		"fas fa-clipboard",
		"far fa-clipboard",
		"fas fa-clone",
		"far fa-clone",
		"fas fa-cloud",
		"fas fa-cloud-download-alt",
		"fas fa-cloud-upload-alt",
		"fas fa-coffee",
		"fas fa-cog",
		"fas fa-cogs",
		"fas fa-copy",
		"far fa-copy",
		"fas fa-cut",
		"fas fa-database",
		"fas fa-dot-circle",
		"far fa-dot-circle",
		"fas fa-download",
		"fas fa-edit",
		"far fa-edit",
		"fas fa-ellipsis-h",
		"fas fa-ellipsis-v",
		"fas fa-envelope",
		"far fa-envelope",
		"fas fa-envelope-open",
		"far fa-envelope-open",
		"fas fa-eraser",
		"fas fa-exclamation",
		"fas fa-exclamation-circle",
		"fas fa-exclamation-triangle",
		"fas fa-external-link-alt",
		"fas fa-external-link-square-alt",
		"fas fa-eye",
		"fas fa-eye-slash",
		"far fa-eye-slash",
		"fas fa-file",
		"far fa-file",
		"fas fa-file-alt",
		"far fa-file-alt",
		"fas fa-filter",
		"fas fa-flag",
		"far fa-flag",
		"fas fa-flag-checkered",
		"fas fa-folder",
		"far fa-folder",
		"fas fa-folder-open",
		"far fa-folder-open",
		"fas fa-frown",
		"far fa-frown",
		"fas fa-hashtag",
		"fas fa-heart",
		"far fa-heart",
		"fas fa-history",
		"fas fa-home",
		"fas fa-i-cursor",
		"fas fa-info",
		"fas fa-info-circle",
		"fas fa-language",
		"fas fa-magic",
		"fas fa-meh",
		"far fa-meh",
		"fas fa-microphone",
		"fas fa-microphone-slash",
		"fas fa-minus",
		"fas fa-minus-circle",
		"fas fa-minus-square",
		"far fa-minus-square",
		"fas fa-paste",
		"fas fa-pencil-alt",
		"fas fa-plus",
		"fas fa-plus-circle",
		"fas fa-plus-square",
		"far fa-plus-square",
		"fas fa-qrcode",
		"fas fa-question",
		"fas fa-question-circle",
		"far fa-question-circle"
	],
	"Maps": [
		"fas fa-ambulance",
		"fas fa-anchor",
		"fas fa-balance-scale",
		"fas fa-bath",
		"fas fa-bed",
		"fas fa-beer",
		"fas fa-bell",
		"far fa-bell",
		"fas fa-bell-slash",
		"far fa-bell-slash",
		"fas fa-bicycle",
		"fas fa-binoculars",
		"fas fa-birthday-cake",
		"fas fa-blind",
		"fas fa-bomb",
		"fas fa-book",
		"fas fa-bookmark",
		"far fa-bookmark",
		"fas fa-briefcase",
		"fas fa-building",
		"far fa-building",
		"fas fa-car",
		"fas fa-coffee",
		"fas fa-crosshairs",
		"fas fa-dollar-sign",
		"fas fa-eye",
		"fas fa-eye-slash",
		"far fa-eye-slash",
		"fas fa-fighter-jet",
		"fas fa-fire",
		"fas fa-fire-extinguisher",
		"fas fa-flag",
		"far fa-flag",
		"fas fa-flag-checkered",
		"fas fa-flask",
		"fas fa-gamepad",
		"fas fa-gavel",
		"fas fa-gift",
		"fas fa-glass-martini",
		"fas fa-globe",
		"fas fa-graduation-cap",
		"fas fa-h-square",
		"fas fa-heart",
		"far fa-heart",
		"fas fa-heartbeat",
		"fas fa-home",
		"fas fa-hospital",
		"far fa-hospital",
		"fas fa-image",
		"far fa-image",
		"fas fa-images",
		"far fa-images",
		"fas fa-industry",
		"fas fa-info",
		"fas fa-info-circle",
		"fas fa-key",
		"fas fa-leaf",
		"fas fa-lemon",
		"far fa-lemon",
		"fas fa-life-ring",
		"far fa-life-ring",
		"fas fa-lightbulb",
		"far fa-lightbulb",
		"fas fa-location-arrow",
		"fas fa-low-vision",
		"fas fa-magnet",
		"fas fa-male",
		"fas fa-map",
		"far fa-map",
		"fas fa-map-marker",
		"fas fa-map-marker-alt",
		"fas fa-map-pin",
		"fas fa-map-signs",
		"fas fa-medkit",
		"fas fa-money-bill-alt",
		"far fa-money-bill-alt",
		"fas fa-motorcycle",
		"fas fa-music",
		"fas fa-newspaper",
		"far fa-newspaper",
		"fas fa-paw",
		"fas fa-phone",
		"fas fa-phone-square",
		"fas fa-phone-volume",
		"fas fa-plane",
		"fas fa-plug",
		"fas fa-plus",
		"fas fa-plus-square",
		"far fa-plus-square",
		"fas fa-print",
		"fas fa-recycle",
		"fas fa-road",
		"fas fa-rocket",
		"fas fa-search",
		"fas fa-search-minus",
		"fas fa-search-plus",
		"fas fa-ship",
		"fas fa-shopping-bag",
		"fas fa-shopping-basket",
		"fas fa-shopping-cart",
		"fas fa-shower",
		"fas fa-street-view",
		"fas fa-subway",
		"fas fa-suitcase",
		"fas fa-tag",
		"fas fa-tags",
		"fas fa-taxi",
		"fas fa-thumbtack"
	],
	"Objects": [
		"fas fa-ambulance",
		"fas fa-anchor",
		"fas fa-archive",
		"fas fa-balance-scale",
		"fas fa-bath",
		"fas fa-bed",
		"fas fa-beer",
		"fas fa-bell",
		"far fa-bell",
		"fas fa-bicycle",
		"fas fa-binoculars",
		"fas fa-birthday-cake",
		"fas fa-bomb",
		"fas fa-book",
		"fas fa-bookmark",
		"far fa-bookmark",
		"fas fa-briefcase",
		"fas fa-bug",
		"fas fa-building",
		"far fa-building",
		"fas fa-bullhorn",
		"fas fa-bullseye",
		"fas fa-bus",
		"fas fa-calculator",
		"fas fa-calendar",
		"far fa-calendar",
		"fas fa-calendar-alt",
		"far fa-calendar-alt",
		"fas fa-camera",
		"fas fa-camera-retro",
		"fas fa-car",
		"fas fa-clipboard",
		"far fa-clipboard",
		"fas fa-cloud",
		"fas fa-coffee",
		"fas fa-cog",
		"fas fa-cogs",
		"fas fa-compass",
		"far fa-compass",
		"fas fa-copy",
		"far fa-copy",
		"fas fa-cube",
		"fas fa-cubes",
		"fas fa-cut",
		"fas fa-envelope",
		"far fa-envelope",
		"fas fa-envelope-open",
		"far fa-envelope-open",
		"fas fa-eraser",
		"fas fa-eye",
		"fas fa-eye-dropper",
		"fas fa-fax",
		"fas fa-fighter-jet",
		"fas fa-file",
		"far fa-file",
		"fas fa-file-alt",
		"far fa-file-alt",
		"fas fa-film",
		"fas fa-fire",
		"fas fa-fire-extinguisher",
		"fas fa-flag",
		"far fa-flag",
		"fas fa-flag-checkered",
		"fas fa-flask",
		"fas fa-futbol",
		"far fa-futbol",
		"fas fa-gamepad",
		"fas fa-gavel",
		"fas fa-gem",
		"far fa-gem",
		"fas fa-gift",
		"fas fa-glass-martini",
		"fas fa-globe",
		"fas fa-graduation-cap",
		"fas fa-hdd",
		"far fa-hdd",
		"fas fa-headphones",
		"fas fa-heart",
		"far fa-heart",
		"fas fa-home",
		"fas fa-hospital",
		"far fa-hospital",
		"fas fa-hourglass",
		"far fa-hourglass",
		"fas fa-image",
		"far fa-image",
		"fas fa-images",
		"far fa-images",
		"fas fa-industry",
		"fas fa-key",
		"fas fa-keyboard",
		"far fa-keyboard",
		"fas fa-laptop",
		"fas fa-leaf",
		"fas fa-lemon",
		"far fa-lemon",
		"fas fa-life-ring",
		"far fa-life-ring",
		"fas fa-lightbulb",
		"far fa-lightbulb",
		"fas fa-lock",
		"fas fa-lock-open",
		"fas fa-magic",
		"fas fa-magnet",
		"fas fa-map",
		"far fa-map",
		"fas fa-map-marker",
		"fas fa-map-marker-alt"
	],
	"Payments & Shopping": [
		"fab fa-amazon-pay",
		"fab fa-apple-pay",
		"fas fa-bell",
		"far fa-bell",
		"fas fa-bookmark",
		"far fa-bookmark",
		"fas fa-bullhorn",
		"fas fa-camera",
		"fas fa-camera-retro",
		"fas fa-cart-arrow-down",
		"fas fa-cart-plus",
		"fab fa-cc-amazon-pay",
		"fab fa-cc-amex",
		"fab fa-cc-apple-pay",
		"fab fa-cc-diners-club",
		"fab fa-cc-discover",
		"fab fa-cc-jcb",
		"fab fa-cc-mastercard",
		"fab fa-cc-paypal",
		"fab fa-cc-stripe",
		"fab fa-cc-visa",
		"fas fa-certificate",
		"fas fa-credit-card",
		"far fa-credit-card",
		"fab fa-ethereum",
		"fas fa-gem",
		"far fa-gem",
		"fas fa-gift",
		"fab fa-google-wallet",
		"fas fa-handshake",
		"far fa-handshake",
		"fas fa-heart",
		"far fa-heart",
		"fas fa-key",
		"fab fa-paypal",
		"fas fa-shopping-bag",
		"fas fa-shopping-basket",
		"fas fa-shopping-cart",
		"fas fa-star",
		"far fa-star",
		"fab fa-stripe",
		"fab fa-stripe-s",
		"fas fa-tag",
		"fas fa-tags",
		"fas fa-thumbs-down",
		"far fa-thumbs-down",
		"fas fa-thumbs-up",
		"far fa-thumbs-up",
		"fas fa-trophy"
	],
	"Shapes": [
		"fas fa-bookmark",
		"far fa-bookmark",
		"fas fa-calendar",
		"far fa-calendar",
		"fas fa-certificate",
		"fas fa-circle",
		"far fa-circle",
		"fas fa-cloud",
		"fas fa-comment",
		"far fa-comment",
		"fas fa-file",
		"far fa-file",
		"fas fa-folder",
		"far fa-folder",
		"fas fa-heart",
		"far fa-heart",
		"fas fa-map-marker",
		"fas fa-play",
		"fas fa-square",
		"far fa-square",
		"fas fa-star",
		"far fa-star"
	],
	"Spinners": [
		"fas fa-asterisk",
		"fas fa-certificate",
		"fas fa-circle-notch",
		"fas fa-cog",
		"fas fa-compass",
		"far fa-compass",
		"fas fa-crosshairs",
		"fas fa-life-ring",
		"far fa-life-ring",
		"fas fa-snowflake",
		"far fa-snowflake",
		"fas fa-spinner",
		"fas fa-sun",
		"far fa-sun",
		"fas fa-sync"
	],
	"Sports": [
		"fas fa-baseball-ball",
		"fas fa-basketball-ball",
		"fas fa-bowling-ball",
		"fas fa-football-ball",
		"fas fa-futbol",
		"far fa-futbol",
		"fas fa-golf-ball",
		"fas fa-hockey-puck",
		"fas fa-quidditch",
		"fas fa-table-tennis",
		"fas fa-volleyball-ball"
	],
	"Status": [
		"fas fa-ban",
		"fas fa-battery-empty",
		"fas fa-battery-full",
		"fas fa-battery-half",
		"fas fa-battery-quarter",
		"fas fa-battery-three-quarters",
		"fas fa-bell",
		"far fa-bell",
		"fas fa-bell-slash",
		"far fa-bell-slash",
		"fas fa-calendar",
		"far fa-calendar",
		"fas fa-calendar-alt",
		"far fa-calendar-alt",
		"fas fa-calendar-check",
		"far fa-calendar-check",
		"fas fa-calendar-minus",
		"far fa-calendar-minus",
		"fas fa-calendar-plus",
		"far fa-calendar-plus",
		"fas fa-calendar-times",
		"far fa-calendar-times",
		"fas fa-cart-arrow-down",
		"fas fa-cart-plus",
		"fas fa-exclamation",
		"fas fa-exclamation-circle",
		"fas fa-exclamation-triangle",
		"fas fa-eye",
		"fas fa-eye-slash",
		"far fa-eye-slash",
		"fas fa-file",
		"far fa-file",
		"fas fa-file-alt",
		"far fa-file-alt",
		"fas fa-folder",
		"far fa-folder",
		"fas fa-folder-open",
		"far fa-folder-open",
		"fas fa-info",
		"fas fa-info-circle",
		"fas fa-lock",
		"fas fa-lock-open",
		"fas fa-minus",
		"fas fa-minus-circle",
		"fas fa-minus-square",
		"far fa-minus-square",
		"fas fa-plus",
		"fas fa-plus-circle",
		"fas fa-plus-square",
		"far fa-plus-square",
		"fas fa-question",
		"fas fa-question-circle",
		"far fa-question-circle",
		"fas fa-shield-alt",
		"fas fa-shopping-cart",
		"fas fa-sign-in-alt",
		"fas fa-sign-out-alt",
		"fas fa-thermometer-empty",
		"fas fa-thermometer-full",
		"fas fa-thermometer-half",
		"fas fa-thermometer-quarter",
		"fas fa-thermometer-three-quarters",
		"fas fa-thumbs-down",
		"far fa-thumbs-down",
		"fas fa-thumbs-up",
		"far fa-thumbs-up",
		"fas fa-toggle-off",
		"fas fa-toggle-on",
		"fas fa-unlock",
		"fas fa-unlock-alt"
	],
	"Users & People": [
		"fab fa-accessible-icon",
		"fas fa-address-book",
		"far fa-address-book",
		"fas fa-address-card",
		"far fa-address-card",
		"fas fa-bed",
		"fas fa-blind",
		"fas fa-child",
		"fas fa-female",
		"fas fa-frown",
		"far fa-frown",
		"fas fa-id-badge",
		"far fa-id-badge",
		"fas fa-id-card",
		"far fa-id-card",
		"fas fa-male",
		"fas fa-meh",
		"far fa-meh",
		"fas fa-power-off",
		"fas fa-smile",
		"far fa-smile",
		"fas fa-street-view",
		"fas fa-user",
		"far fa-user",
		"fas fa-user-circle",
		"far fa-user-circle",
		"fas fa-user-md",
		"fas fa-user-plus",
		"fas fa-user-secret",
		"fas fa-user-times",
		"fas fa-users",
		"fas fa-wheelchair"
	],
	"Vehicles": [
		"fab fa-accessible-icon",
		"fas fa-ambulance",
		"fas fa-bicycle",
		"fas fa-bus",
		"fas fa-car",
		"fas fa-fighter-jet",
		"fas fa-motorcycle",
		"fas fa-paper-plane",
		"far fa-paper-plane",
		"fas fa-plane",
		"fas fa-rocket",
		"fas fa-ship",
		"fas fa-shopping-cart",
		"fas fa-space-shuttle",
		"fas fa-subway",
		"fas fa-taxi",
		"fas fa-train",
		"fas fa-truck",
		"fas fa-wheelchair"
	],
	"Writing": [
		"fas fa-archive",
		"fas fa-book",
		"fas fa-bookmark",
		"far fa-bookmark",
		"fas fa-edit",
		"far fa-edit",
		"fas fa-envelope",
		"far fa-envelope",
		"fas fa-envelope-open",
		"far fa-envelope-open",
		"fas fa-eraser",
		"fas fa-file",
		"far fa-file",
		"fas fa-file-alt",
		"far fa-file-alt",
		"fas fa-folder",
		"far fa-folder",
		"fas fa-folder-open",
		"far fa-folder-open",
		"fas fa-keyboard",
		"far fa-keyboard",
		"fas fa-newspaper",
		"far fa-newspaper",
		"fas fa-paper-plane",
		"far fa-paper-plane",
		"fas fa-paperclip",
		"fas fa-paragraph",
		"fas fa-pen-square",
		"fas fa-pencil-alt",
		"fas fa-quote-left",
		"fas fa-quote-right",
		"fas fa-sticky-note",
		"far fa-sticky-note",
		"fas fa-thumbtack"
	]
};

jQuery( '#add-category-icon' ).fontIconPicker( {
  source: icons,
  emptyIcon: false,
    iconGenerator: function( icon ) {
      return '<i class="' + icon + '"></i>';
  }
} );

//saveDomains([])
//saveCategories([])
