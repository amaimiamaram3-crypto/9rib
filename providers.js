import { db } from "./firebase.js";
import { regions } from "./regions.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const providersList = document.getElementById("providersList");
const providersEmpty = document.getElementById("providersEmpty");
const searchInput = document.getElementById("providerSearchInput");

const govFilter = document.getElementById("providerGovernorateFilter");
const delFilter = document.getElementById("providerDelegationFilter");
const catFilter = document.getElementById("providerCategoryFilter");
const resetButton = document.getElementById("resetProviderFilters");

let allProviders = [];

function getDelegationName(item) {
    if (typeof item === "string") return item;
    return item.name?.fr || item.name?.local || item.name?.en || "";
}

// Fill governorates
function loadFilterGovernorates() {
    Object.keys(regions).forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        govFilter.appendChild(option);
    });
}

// Fill delegations
function loadFilterDelegations() {
    const selected = govFilter.value;

    delFilter.innerHTML =
        '<option value="">Toutes les délégations</option>';

    delFilter.disabled = !selected;

    if (!selected || !Array.isArray(regions[selected])) return;

    regions[selected].forEach(item => {
        const name = getDelegationName(item);
        if (!name) return;

        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        delFilter.appendChild(option);
    });
}

// Read providers from Firebase
async function loadProviders() {
    providersList.textContent = "Chargement des services...";

    try {
        const snapshot = await getDocs(collection(db, "providers"));

        allProviders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        filterProviders();

    } catch (error) {
        console.error(error);
        providersList.textContent =
            "Impossible de charger les services.";
    }
}

// Apply filters
function filterProviders() {
    const search = searchInput?.value.trim().toLowerCase() || "";
    const gov = govFilter.value;
    const del = delFilter.value;
    const cat = catFilter.value.toLowerCase();

    const filtered = allProviders.filter(provider => {
        const name = (provider.businessName || "").toLowerCase();
        const category = (provider.category || "").toLowerCase();
        const governorate = provider.governorate || "";
        const delegation = provider.delegation || "";

        const matchesSearch =
            [name, category, governorate.toLowerCase(),
             delegation.toLowerCase()].some(value => value.includes(search));

        return matchesSearch &&
            (!gov || governorate === gov) &&
            (!del || delegation === del) &&
            (!cat || category === cat);
    });

    displayProviders(filtered);
}

// Display cards
function displayProviders(providers) {
    providersList.innerHTML = "";
    providersEmpty.hidden = providers.length !== 0;

    providers.forEach(provider => {
        const card = document.createElement("article");
        card.className = "provider-card";
        card.style.cursor = "pointer";
        card.addEventListener("click", () => {
            console.log("provider ID;" , provider.id);
            window.location.href =
            "details.html?id=" + encodeURIComponent(provider.id);
});

        const title = document.createElement("h3");
        title.textContent = provider.businessName || "Sans nom";

        const category = document.createElement("p");
        category.textContent = "Catégorie : " + (provider.category || "—");

        const location = document.createElement("p");
        location.textContent =
            (provider.delegation || "") + ", " +
            (provider.governorate || "");

        const address = document.createElement("p");
        address.textContent = "Adresse : " + (provider.address || "—");

        card.append(title, category, location, address);
        providersList.appendChild(card);
    });
}

// Events
govFilter.addEventListener("change", () => {
    loadFilterDelegations();
    filterProviders();
});

delFilter.addEventListener("change", filterProviders);
catFilter.addEventListener("change", filterProviders);
searchInput?.addEventListener("input", filterProviders);

resetButton.addEventListener("click", () => {
    govFilter.value = "";
    delFilter.innerHTML =
        '<option value="">Toutes les délégations</option>';
    delFilter.disabled = true;
    catFilter.value = "";
    if (searchInput) searchInput.value = "";
    filterProviders();
});

// Start
loadFilterGovernorates();
loadProviders();

// =====================================
// SEARCH PROVIDERS BY USER'S PROBLEM
// =====================================

const problemInput = document.getElementById("problemInput");
const problemSearchButton = document.getElementById("problemSearchButton");
const problemSearchMessage = document.getElementById("problemSearchMessage");
const problemResults = document.getElementById("problemResults");

const userGovernorate = document.getElementById("governorate");
const userDelegation = document.getElementById("delegation");

// Normalize text: lowercase + remove accents
function normalizeText(text) {
    return (text || "")
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

// Keywords and their synonyms
const problemKeywords = [
    ["plombier", "plomberie", "fuite", "robinet", "tuyau", "water", "سباك", "تسرب", "ماء"],
    ["electricien", "electricite", "panne electrique", "courant", "prise", "lumiere", "كهربائي", "كهرباء"],
    ["climatisation", "climatiseur", "clim", "chauffage", "مكيف", "تكييف"],
    ["menuisier", "menuiserie", "porte", "fenetre", "bois", "نجار", "نجارة"],
    ["peintre", "peinture", "mur", "دهن", "صباغ"],
    ["mecanicien", "mecanique", "voiture", "panne voiture", "ميكانيكي", "سيارة"],
    ["coiffeur", "coiffure", "cheveux", "حلاق", "حلاقة"],
    ["medecin", "docteur", "medical", "sante", "طبيب", "صحة"],
    ["pharmacie", "pharmacien", "medicament", "دواء", "صيدلية"],
    ["nettoyage", "menage", "femme de menage", "تنظيف"],
    ["informatique", "ordinateur", "reparation pc", "computer", "كمبيوتر"],
    ["jardinier", "jardinage", "jardin", "حديقة"]
];

function findMatchingProviders(problem, governorate, delegation) {
    const normalizedProblem = normalizeText(problem);

    const matchingGroups = problemKeywords.filter(group =>
        group.some(word => normalizedProblem.includes(normalizeText(word)))
    );

    // Also use words written directly by the user
    const directWords = normalizedProblem
        .split(/\s+/)
        .filter(word => word.length >= 3);

    return allProviders
        .filter(provider => {
            if (provider.governorate !== governorate) return false;
            if (provider.delegation !== delegation) return false;

            const providerInfo = normalizeText([
                provider.businessName,
                provider.category,
                provider.serviceType,
                provider.address
            ].join(" "));

            const matchesSynonym = matchingGroups.some(group =>
                group.some(word =>
                    providerInfo.includes(normalizeText(word))
                )
            );

            const matchesDirectWord = directWords.some(word =>
                providerInfo.includes(word)
            );

            return matchesSynonym || matchesDirectWord;
        });
}

function displayProblemResults(providers) {
    problemResults.innerHTML = "";

    if (providers.length === 0) {
        problemSearchMessage.textContent =
            "Aucun professionnel correspondant trouvé dans cette délégation.";
        return;
    }

    problemSearchMessage.textContent =
        providers.length + " professionnel(s) trouvé(s) dans votre région.";

    providers.forEach(provider => {
        const card = document.createElement("article");
        card.className = "provider-card";
        card.style.cursor = "pointer";

        const title = document.createElement("h3");
        title.textContent = provider.businessName || "Sans nom";

        const category = document.createElement("p");
        category.textContent =
            "Catégorie : " + (provider.category || "—");

        const service = document.createElement("p");
        service.textContent =
            "Service : " + (provider.serviceType || "—");

        const address = document.createElement("p");
        address.textContent =
            "Adresse : " + (provider.address || "—");

        card.append(title, category, service, address);

        card.addEventListener("click", () => {
            window.location.href =
                "details.html?id=" + encodeURIComponent(provider.id);
        });

        problemResults.appendChild(card);
    });
}

function searchByProblem() {
    const problem = problemInput.value.trim();
    const governorate = userGovernorate.value;
    const delegation = userDelegation.value;

    problemResults.innerHTML = "";
    problemSearchMessage.textContent = "";

    if (!governorate || !delegation) {
        problemSearchMessage.textContent =
            "Veuillez choisir votre gouvernorat et votre délégation.";
        return;
    }

    if (!problem) {
        problemSearchMessage.textContent =
            "Veuillez décrire votre problème.";
        return;
    }

    if (allProviders.length === 0) {
        problemSearchMessage.textContent =
            "Aucun prestataire disponible pour le moment.";
        return;
    }

    const results = findMatchingProviders(
        problem,
        governorate,
        delegation
    );

    displayProblemResults(results);
}

if (problemSearchButton) {
    problemSearchButton.addEventListener("click", searchByProblem);
}

if (problemInput) {
    problemInput.addEventListener("keydown", event => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            searchByProblem();
        }
    });
}

