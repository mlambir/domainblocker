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

function toggleAddDomainToBlockFormVisibility() {
	const form =  document.getElementById("add-domain-to-block-form")
	form.hasAttribute("hidden") ?
		form.removeAttribute("hidden") :
		form.setAttribute("hidden", '');
}

function toggleAddCategoryFormVisibility() {
	const form =  document.getElementById("add-category-form")
	form.hasAttribute("hidden") ?
		form.removeAttribute("hidden") :
		form.setAttribute("hidden", '');
}

function getDomainData() {
	return {
		domain: document.getElementById("domain").value,
		category: document.getElementById("category-select").value,
		enabled: "true"
	}
}

function updateDomainTable() {
	getDomains().then(domains => {
		if (!domains.length) {
			return
		}
		let table = new DataTable(".domains-table", {
			data: {
				headings: ["Domains", "Category", "Enabled"],
				data: domains.map(item => Object.values(item))
			},
		})
	});
}

function updateCategoriesTable() {
	getCategories().then(categories => {
		if (!categories.length) {
			return
		}
		let table = new DataTable(".categories-table", {
			data: {
				headings: ["Name", "Color", "Icon", "Enabled"],
				data: categories.map(item => Object.values(item))
			},
		})
	});
}

function updateTables() {
	updateDomainTable();
	updateCategoriesTable();
}

function showDomainAlreadyExistsError(domain) {
	const error = document.createTextNode(`The domain: ${domain.domain} is already blocked!`);
	document.querySelector("#error-container").appendChild(error);
}
updateTables();

document.getElementById("add-domain-to-block").addEventListener("click", (e) => {
	addCategorySelectOptions();
});

document.querySelector("#add-new-category").addEventListener("click", (e) => {
	toggleAddCategoryFormVisibility();
});

document.querySelector("#add-domain").addEventListener("click", (e) => {
	const domainData = getDomainData();
	getDomains().then((domains) => {
		domains.map((domain) => domain.domain).include(domainData.domain) ?
			showDomainAlreadyExistsError(domainData):
			domains.push(domainData);
		saveDomains(domains);
	})
	updateDomainTable()
	toggleAddDomainToBlockFormVisibility();
});

