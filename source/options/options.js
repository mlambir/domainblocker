import {getCategories, getDomains, saveCategories, saveDomains} from "./storage";
import {DataTable} from "simple-datatables"

function addCategorySelectOptions() {
	getCategories().then(categories => {
		const select = document.getElementById('category-select');
		for(let category of categories) {
			let option = document.createElement('option');
			option.appendChild( document.createTextNode(category.name) );
			option.value = category.name;
			select.appendChild(option);
		}
	})
}

function showAddDomainToBlockForm() {
	const form =  document.getElementById("add-domain-to-block-form")
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

function updateTable() {
	getDomains().then(domains => {
		if (!domains.length) {
			return
		}
		console.log(domains[0])
		let table = new DataTable(".domains-table", {
			data: {
				headings: ["Domains", "Category", "Enabled"],
				data: domains.map(item => Object.values(item))
			},
		})
	});
}

updateTable();

document.querySelector("#add-domain-to-block").addEventListener("click", (e) => {
	addCategorySelectOptions();
	showAddDomainToBlockForm();
});

document.querySelector("#add-domain").addEventListener("click", (e) => {
	const domainData = getDomainData();
	getDomains().then((domains) => {
		domains.push(domainData)
		saveDomains(domains);
	})
	updateTable()
	showAddDomainToBlockForm();
});

