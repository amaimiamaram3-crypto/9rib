// =====================================
// 1. TUNISIA GOVERNORATES & DELEGATIONS
// =====================================

const regions = {
    "Tunis": ["Tunis Médina", "Bab Bhar", "Bab Souika", "Sidi El Béchir", "El Omrane", "El Omrane Supérieur", "Ettahrir", "El Menzah", "Cité El Khadra", "Bardo", "Séjoumi", "Sidi Hassine", "Ezzouhour", "La Marsa", "Carthage", "Sidi Bou Said", "Le Kram", "La Goulette"],
    "Ariana": ["Ariana Ville", "La Soukra", "Raoued", "Kalâat El Andalous", "Sidi Thabet", "Ettadhamen", "Mnihla"],
    "Ben Arous": ["Ben Arous", "El Mourouj", "Hammam Lif", "Hammam Chott", "Bou Mhel El Bassatine", "Ezzahra", "Radès", "Mégrine", "Mohamedia", "Fouchana", "Mornag", "Nouvelle Médina"],
    "Manouba": ["Manouba", "Douar Hicher", "Oued Ellil", "Tebourba", "Djedeida", "Mornaguia", "Borj El Amri", "El Battan"],
    "Nabeul": ["Nabeul", "Dar Chaabane El Fehri", "Béni Khiar", "Korba", "Menzel Temime", "Menzel Bouzelfa", "Soliman", "Grombalia", "Hammamet", "Kelibia", "El Haouaria", "Takelsa", "Béni Khalled", "Bou Argoub", "Hammam Ghezèze", "Azmour"],
    "Zaghouan": ["Zaghouan", "Zriba", "Bir Mcherga", "Fahs", "Nadhour", "Saouaf"],
    "Bizerte": ["Bizerte Nord", "Bizerte Sud", "Menzel Bourguiba", "Tinja", "Mateur", "Ghezala", "Joumine", "Ghar El Melh", "Ras Jebel", "Sejnane", "Menzel Jemil", "El Alia", "Utique"],
    "Béja": ["Béja Nord", "Béja Sud", "Amdoun", "Nefza", "Teboursouk", "Testour", "Goubellat", "Thibar"],
    "Jendouba": ["Jendouba", "Jendouba Nord", "Bou Salem", "Tabarka", "Aïn Draham", "Fernana", "Ghardimaou", "Oued Mliz", "Balta-Bou Aouane"],
    "Le Kef": ["Le Kef Est", "Le Kef Ouest", "Nebeur", "Sakiet Sidi Youssef", "Tajerouine", "Kalaat Senan", "Kalaat Khasba", "Jérissa", "El Ksour", "Dahmani", "Sers"],
    "Siliana": ["Siliana Nord", "Siliana Sud", "Bou Arada", "Gaâfour", "El Krib", "Bargou", "Makthar", "Kesra", "Rouhia", "Sidi Bou Rouis"],
    "Sousse": ["Sousse Ville", "Sousse Riadh", "Sousse Jawhara", "Sousse Sidi Abdelhamid", "Hammam Sousse", "Akouda", "Kalâa Kebira", "Kalâa Seghira", "Msaken", "Enfidha", "Bouficha", "Hergla", "Kondar", "Sidi Bou Ali", "Sidi El Hani", "Zaouiet Sousse"],
    "Monastir": ["Monastir", "Moknine", "Jemmal", "Ksar Hellal", "Sahline", "Ksibet El Mediouni", "Bembla", "Téboulba", "Bekalta", "Sayada-Lamta-Bou Hajar", "Ouerdanine", "Zéramdine", "Beni Hassen", "Ghenada"],
    "Mahdia": ["Mahdia", "Ksour Essef", "Chebba", "Melloulèche", "Sidi Alouane", "Bou Merdes", "Ouled Chamekh", "Chorbane", "El Jem", "Hbira", "Souassi"],
    "Sfax": ["Sfax Ville", "Sfax Ouest", "Sfax Sud", "Sakiet Ezzit", "Sakiet Eddaier", "Thyna", "Gremda", "Chihia", "El Ain", "Agareb", "Jebiniana", "El Amra", "Menzel Chaker", "Bir Ali Ben Khalifa", "Skhira", "Mahres", "Kerkennah", "Ghraiba"],
    "Kairouan": ["Kairouan Nord", "Kairouan Sud", "Chebika", "Sbikha", "Oueslatia", "Haffouz", "Hajeb El Ayoun", "Nasrallah", "Bou Hajla", "Chrarda", "El Alâa", "Menzel Mehiri"],
    "Kasserine": ["Kasserine Nord", "Kasserine Sud", "Ezzouhour", "Sbeitla", "Sbiba", "Jedelienne", "Thala", "Fériana", "Foussana", "Haïdra", "Majel Bel Abbès", "Hassi El Ferid", "El Ayoun"],
    "Sidi Bouzid": ["Sidi Bouzid Est", "Sidi Bouzid Ouest", "Jilma", "Cebbala Ouled Asker", "Bir El Hfay", "Sidi Ali Ben Aoun", "Menzel Bouzaiane", "Meknassy", "Mezzouna", "Regueb", "Ouled Haffouz", "Souk Jedid"],
    "Gabès": ["Gabès Médina", "Gabès Ouest", "Gabès Sud", "Ghannouch", "Métouia", "Menzel El Habib", "Mareth", "Matmata", "Nouvelle Matmata", "El Hamma", "El Hamma Ouest"],
    "Médenine": ["Médenine Nord", "Médenine Sud", "Ben Guerdane", "Zarzis", "Djerba Houmt Souk", "Djerba Midoun", "Djerba Ajim", "Sidi Makhlouf", "Béni Khedache"],
    "Tataouine": ["Tataouine Nord", "Tataouine Sud", "Ghomrassen", "Bir Lahmar", "Dehiba", "Remada", "Smar"],
    "Gafsa": ["Gafsa Nord", "Gafsa Sud", "Moularès", "Redeyef", "Métlaoui", "Mdhilla", "El Ksar", "Sened", "Belkhir", "Sidi Aïch", "Oum El Araies"],
    "Tozeur": ["Tozeur", "Degache", "Nefta", "Tameghza", "Hazoua"],
    "Kébili": ["Kébili Nord", "Kébili Sud", "Douz Nord", "Douz Sud", "Souk Lahad", "Faouar"]
};

// =====================================
// 2. GET HTML ELEMENTS
// =====================================

const languageSelect = document.getElementById("languageSelect");
const governorate = document.getElementById("governorate");
const delegation = document.getElementById("delegation");
const neighborhood = document.getElementById("neighborhood");
const saveLocation = document.getElementById("saveLocation");
const locationResult = document.getElementById("locationResult");

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

const nearbyResults = document.getElementById("nearbyResults");
const noNearbyResults = document.getElementById("noNearbyResults");


// =====================================
// 3. TRANSLATIONS
// =====================================

const translations = {
    fr: {
        chooseGov: "Choisir un gouvernorat",
        chooseDel: "Choisir une délégation",
        saved: "Votre région a été enregistrée ✓",
        error: "Choisissez d'abord votre gouvernorat et votre délégation.",
        nearby: "Choisissez votre région pour découvrir les catégories de services.",
        noResults: "Aucun service ne correspond à votre recherche.",
        search: "Rechercher",
        area: "Trouvez les services autour de vous",
        areaDesc: "Choisissez votre gouvernorat et votre délégation pour découvrir les services proches de vous.",
        gov: "Gouvernorat",
        del: "Délégation",
        district: "Quartier (facultatif)",
        save: "Enregistrer ma région",
        placeholder: "Quel service recherchez-vous ?",
        districtPlaceholder: "Exemple : Sfax Ville"
    },
    en: {
        chooseGov: "Choose governorate",
        chooseDel: "Choose delegation",
        saved: "Your location has been saved ✓",
        error: "Choose your governorate and delegation first.",
        nearby: "Choose your location to discover service categories.",
        noResults: "No services match your search.",
        search: "Search",
        area: "Find services around you",
        areaDesc: "Choose your governorate and delegation to discover nearby services.",
        gov: "Governorate",
        del: "Delegation",
        district: "Neighborhood (optional)",
        save: "Save my location",
        placeholder: "What service are you looking for?",
        districtPlaceholder: "Example: Sfax Ville"
    },
    ar: {
        chooseGov: "اختر الولاية",
        chooseDel: "اختر المعتمدية",
        saved: "تم حفظ منطقتك بنجاح ✓",
        error: "اختار الولاية والمعتمدية أولاً.",
        nearby: "اختار منطقتك لاكتشاف أصناف الخدمات.",
        noResults: "ما لقيناش خدمات تطابق بحثك.",
        search: "ابحث",
        area: "اكتشف الخدمات القريبة منك",
        areaDesc: "اختار الولاية والمعتمدية متاعك لاكتشاف الخدمات القريبة.",
        gov: "الولاية",
        del: "المعتمدية",
        district: "الحي (اختياري)",
        save: "احفظ منطقتي",
        placeholder: "شنوّة الخدمة اللي تبحث عليها؟",
        districtPlaceholder: "مثال: صفاقس المدينة"
    }
};


// =====================================
// 4. LOAD GOVERNORATES
// =====================================

function loadGovernorates() {
    const currentValue = governorate.value;
    const t = translations[languageSelect.value];

    governorate.innerHTML = "";

    const firstOption = document.createElement("option");
    firstOption.value = "";
    firstOption.textContent = t.chooseGov;
    governorate.appendChild(firstOption);

    Object.keys(regions).forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        governorate.appendChild(option);
    });

    governorate.value = currentValue;
}


// =====================================
// 5. LOAD DELEGATIONS
// =====================================

function updateDelegations(governorateName) {
    const t = translations[languageSelect.value];

    delegation.innerHTML = "";

    const firstOption = document.createElement("option");
    firstOption.value = "";
    firstOption.textContent = t.chooseDel;

    delegation.appendChild(firstOption);

    const list = regions[governorateName] || [];

    list.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        delegation.appendChild(option);
    });

    delegation.disabled = list.length === 0;
}


// =====================================
// 6. SEARCH SERVICES
// =====================================

function searchServices() {
    const search = searchInput.value.trim().toLowerCase();

    const cards = document.querySelectorAll(
        ".services-section .service-card"
    );

    let visibleCount = 0;

    cards.forEach(card => {
        const matches = card.textContent.toLowerCase().includes(search);

        card.style.display = matches ? "" : "none";

        if (matches) visibleCount++;
    });

    const heading = document.querySelector(
        ".services-section .section-heading"
    );

    let message = document.getElementById("searchMessage");

    if (!message) {
        message = document.createElement("p");
        message.id = "searchMessage";
        message.style.textAlign = "center";
        message.style.marginTop = "20px";
        message.style.color = "#6558e8";
        heading.after(message);
    }

    message.textContent =
        visibleCount === 0
            ? translations[languageSelect.value].noResults
            : "";
}




// =====================================
// 7. DISPLAY NEARBY CATEGORIES
// =====================================

function displayNearbyServices() {
    nearbyResults.innerHTML = "";

    const cards = document.querySelectorAll(
        ".services-section .service-card"
    );

    cards.forEach(card => {
        const copy = card.cloneNode(true);
        copy.style.display = "";
        nearbyResults.appendChild(copy);
    });

    noNearbyResults.textContent =
        translations[languageSelect.value].nearby;

    noNearbyResults.style.display = "block";

    
}



// =====================================
// 8. SAVE LOCATION
// =====================================

governorate.addEventListener("change", function() {
    updateDelegations(this.value);
    locationResult.textContent = "";
});

saveLocation.addEventListener("click", function() {
    const t = translations[languageSelect.value];

    if (!governorate.value || !delegation.value) {
        alert(t.error);
        return;
    }

    const saved = {
        governorate: governorate.value,
        delegation: delegation.value,
        neighborhood: neighborhood.value.trim()
    };

    localStorage.setItem("userLocation", JSON.stringify(saved));
    window.dispatchEvent(new Event("9rib-location-changed"));

    locationResult.textContent = t.saved;

    displayNearbyServices();
});


// =====================================
// 9. RESTORE LOCATION
// =====================================

function restoreLocation() {
    let saved;

    try {
        saved = JSON.parse(
            localStorage.getItem("userLocation") || "null"
        );
    } catch (error) {
        localStorage.removeItem("userLocation");
        return;
    }

    if (!saved) return;

    if (!regions[saved.governorate]) return;

    governorate.value = saved.governorate;

    updateDelegations(saved.governorate);

    delegation.value = saved.delegation;

    neighborhood.value = saved.neighborhood || "";

    if (delegation.value) {
        locationResult.textContent =
            translations[languageSelect.value].saved;

        displayNearbyServices();
    }
}


// =====================================
// 10. CHANGE LANGUAGE
// =====================================

function changeLanguage(language) {
    const t = translations[language];

    document.documentElement.lang = language;
    document.body.dir = language === "ar" ? "rtl" : "ltr";

    const navLinks = document.querySelectorAll(".navbar nav a");

    const navTexts = {
        fr: ["Accueil", "Services", "Ma région", "À propos", "Contact"],
        en: ["Home", "Services", "My area", "About", "Contact"],
        ar: ["الرئيسية", "الخدمات", "منطقتي", "من نحن", "اتصل بنا"]
    };

    navLinks.forEach((link, index) => {
        link.textContent = navTexts[language][index];
    });

    const h1 = document.querySelector(".hero h1");

    const heroTitles = {
        fr: ["Tout ce dont vous avez besoin,", "près de chez vous."],
        en: ["Everything you need,", "close to you."],
        ar: ["كل ما تحتاج إليه،", "بالقرب منك."]
    };

    h1.firstChild.textContent = heroTitles[language][0] + " ";
    h1.querySelector("span").textContent = heroTitles[language][1];

    const heroTexts = {
        fr: "Découvrez les services, les commerces et les professionnels autour de vous, partout en Tunisie.",
        en: "Discover local services, shops and professionals around you, everywhere in Tunisia.",
        ar: "اكتشف الخدمات والمحلات والحرفيين القريبين منك في كامل تونس."
    };

    document.querySelector(".small-title").textContent =
        language === "ar" ? "مرحباً بكم في 9ريب" :
        language === "en" ? "WELCOME TO 9RIB" :
        "BIENVENUE SUR 9RIB";

    document.querySelector(".hero-content > p").textContent =
        heroTexts[language];

    searchButton.textContent = t.search;
    searchInput.placeholder = t.placeholder;

    document.querySelector(".location-content h2").textContent = t.area;
    document.querySelector(".location-content > p").textContent = t.areaDesc;

    document.querySelector('label[for="governorate"]').textContent = t.gov;
    document.querySelector('label[for="delegation"]').textContent = t.del;
    document.querySelector('label[for="neighborhood"]').textContent = t.district;

    neighborhood.placeholder = t.districtPlaceholder;

    saveLocation.textContent = t.save;

    loadGovernorates();

    if (governorate.value) {
        updateDelegations(governorate.value);
    }

    const saved = JSON.parse(
        localStorage.getItem("userLocation") || "null"
    );

    if (saved) {
        governorate.value = saved.governorate;
        updateDelegations(saved.governorate);
        delegation.value = saved.delegation;
        neighborhood.value = saved.neighborhood || "";
    }

    if (delegation.value) {
        locationResult.textContent = t.saved;
        displayNearbyServices();
    }
}

languageSelect.addEventListener("change", function() {
    changeLanguage(this.value);
});


// =====================================
// 11. START APPLICATION
// =====================================

loadGovernorates();
restoreLocation();

console.log("9rib is ready!");
