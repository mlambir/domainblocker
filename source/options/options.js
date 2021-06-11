import {getCategories, getDomains, saveCategories, saveDomains} from "./storage";
import {DataTable} from "simple-datatables"
function getElementById(id) {
	return document.getElementById(id);
}

function getElementsByClassName(className) {
	return document.getElementsByClassName(className);
}

function getActionButtonForDomain(domain) {
	return  `<div>
				<button data-domain-name="${domain.domain}" data-domain-category="${domain.category}" data-domain-enabled="${domain.enabled}" class="btn btn-light edit-domain"
				<button data-domain-name="${domain.domain}" data-domain-category="${domain.category}" data-domain-enabled="${domain.enabled}" class="btn btn-light edit-domain"
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
				<button data-category-name="${category.name}" data-category-color="${category.color}" data-category-icon="${category.icon}" data-category-enabled="${category.enabled}" class="btn btn-light edit-category"
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
	}

	if(action === 'edit') {
		data.oldDomain = getElementById(`domain-to-${action}`).getAttribute('data-old-domain');
		data.enabled = getElementById(`${action}-domain-enabled`).value === "true";
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
	getElementById(`${action}-domain-enabled`).value = data.enabled;
}

function getCategoryDataFor(action) {
	let data = {
		name: getElementById(`${action}-category-name`).value,
		color: getElementById(`${action}-category-color`).value,
		icon: getElementById(`${action}-category-icon`).value,
	}

	if(action === 'edit') {
		data.oldCategoryName = getElementById(`${action}-category-name`).getAttribute('data-old-category-name');
		data.enabled = getElementById(`${action}-category-enabled`).value === "true";
	}
	return data;
}

function setCategoryDataToModalFor(action, data) {
	getElementById(`${action}-category-name`).value = data.name;
	getElementById(`${action}-category-name`).setAttribute('data-old-category-name',  data.name);
	getElementById(`${action}-category-color`).value = data.color;
	getElementById(`${action}-category-icon`).value = data.icon;
	getElementById(`${action}-category-enabled`).value = data.enabled;
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
					rowData[2] = rowData[2] ? 'Yes' : 'No';
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
					rowData[3] = rowData[3] ? 'Yes' : 'No';
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
		domains = domains.filter((domain) => domain.domain !== domainData.domain)

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
		categories = categories.filter((category) => category.name !== categoryData.oldCategoryName);
		delete categoryData.oldCategoryName;
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
		categories = categories.filter((category) => category.name !== categoryData.name)

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
				category: target.getAttribute('data-domain-category'),
				enabled: target.getAttribute('data-domain-enabled')
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
				enabled: target.getAttribute('data-category-enabled'),
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


//saveDomains([])
//saveCategories([])
