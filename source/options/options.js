import {getCategories, getDomains, saveDomains} from "./storage";
import {DataTable} from "simple-datatables"


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


function createDomainsTable() {
	const table = new DataTable(".domains-table", {
		data: {
			headings: ["Domains", "Category", "Enabled"],
			data: []
		},
	})
	return function () {
		getDomains().then(domains => {
			if (!domains.length) {
				return
			}
			const newData = {
				headings: ["Domains", "Category", "Enabled"],
				data: domains.map(item => Object.values(item))
			}
			table.rows().remove('all');
			table.insert(newData);

		});
	}
}

function createCategoriesTable() {
	const table = new DataTable(".categories-table", {
		data: {
			headings: ["Name", "Color", "Icon", "Enabled"],
			data: []
		},
	})
	return function () {
		getCategories().then(categories => {
			if (!categories.length) {
				return
			}
			const newData = {
				headings: ["Name", "Color", "Icon", "Enabled"],
				data: categories.map(item => Object.values(item))
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
function updateTables() {
	updateDomainsTable();
	updateCategoriesTable();
}

document.getElementById("add-domain-to-block").addEventListener("click", (e) => {
	addCategorySelectOptions();
});

document.getElementById("add-domain").addEventListener("click", (e) => {
	const domainData = getDomainData();
	createNewDomain(domainData)
});


//saveDomains([])
