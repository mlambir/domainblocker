import {getCategories, getDomains, saveCategories, saveDomains} from "./storage";
import {DataTable} from "simple-datatables"

function getActionButtonForCategory(data, cell, row) {
	return  `<div>
				<button class="btn btn-light"><i class="fa fa-pencil-alt"></i></button>
			 	<button class="btn btn-light"><i class="fa fa-trash"></i></button>
			 </div>`
}

function getActionButtonForDomain(data, cell, row) {
	return  `<div>
				<button class="btn btn-light"><i class="fa fa-pencil-alt"></i></button>
				<button class="btn btn-light"><i class="fa fa-trash"></i></button>
				</div>`

}


function addCategorySelectOptions() {
	getCategories().then(categories => {
		const select = document.getElementById('category-select');
		select.innerHTML = '';
		for(let category of categories) {
			let option = document.createElement('option');
			option.appendChild( document.createTextNode(category.name) );
			option.value = category.name;
			select.appendChild(option);
		}
	})
}

function getDomainData() {
	return {
		domain: document.getElementById("domain").value,
		category: document.getElementById("category-select").value,
		enabled: "true"
	}
}

function getCategoryData() {
	return {
		name: document.getElementById("category-name").value,
		color: document.getElementById("category-color").value,
		icon: document.getElementById("category-icon").value,
		enabled: "true"
	}
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
				return
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
				return
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

		saveDomains(domains).then(() => updateDomainsTable());
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
		});
	})
}

function updateTables() {
	updateDomainsTable();
	updateCategoriesTable();
}
updateTables()
document.getElementById("add-domain-to-block").addEventListener("click", (e) => {
	addCategorySelectOptions();
});

document.getElementById("add-domain").addEventListener("click", (e) => {
	const domainData = getDomainData();
	createNewDomain(domainData)
});

document.getElementById("add-category").addEventListener("click", (e) => {
	const categoryData = getCategoryData();
	createNewCategory(categoryData)
});


//saveDomains([])
