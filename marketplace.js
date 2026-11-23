
import { db, auth } from "./firebase.js";
import { regions } from "./regions.js";

import {
    collection,
    addDoc,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import {
    signInAnonymously
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

// =====================================
// HTML ELEMENTS
// =====================================

const productForm = document.getElementById("productForm");

const productTitle = document.getElementById("productTitle");
const productDescription = document.getElementById("productDescription");
const productType = document.getElementById("productType");
const productPrice = document.getElementById("productPrice");

const productGovernorate = document.getElementById("productGovernorate");
const productDelegation = document.getElementById("productDelegation");

const publishProductButton = document.getElementById("publishProductButton");

const productSuccess = document.getElementById("productSuccess");
const productError = document.getElementById("productError");

const productsList = document.getElementById("productsList");

const filterProductGovernorate =
    document.getElementById("filterProductGovernorate");

const filterProductType =
    document.getElementById("filterProductType");

let allProducts = [];

// =====================================
// 1. POPULATE GOVERNORATES
// =====================================

function loadGovernorates() {

    Object.keys(regions).forEach(governorate => {

        const option1 = document.createElement("option");
        option1.value = governorate;
        option1.textContent = governorate;
        productGovernorate.appendChild(option1);

        const option2 = document.createElement("option");
        option2.value = governorate;
        option2.textContent = governorate;
        filterProductGovernorate.appendChild(option2);

    });

}

// =====================================
// 2. LOAD DELEGATIONS
// =====================================

productGovernorate.addEventListener("change", () => {

    productDelegation.innerHTML =
        '<option value="">اختار المعتمدية</option>';

    const selectedGovernorate = productGovernorate.value;

    if (!selectedGovernorate) {
        productDelegation.disabled = true;
        return;
    }

    const delegations = regions[selectedGovernorate] || [];

    delegations.forEach(delegation => {

        const option = document.createElement("option");
        option.value = delegation;
        option.textContent = delegation;

        productDelegation.appendChild(option);

    });

    productDelegation.disabled = false;

});

// =====================================
// 3. DISPLAY PRODUCTS
// =====================================

function displayProducts() {

    if (!productsList) return;

    productsList.replaceChildren();

    const selectedGovernorate = filterProductGovernorate.value;
    const selectedType = filterProductType.value;

    const filteredProducts = allProducts.filter(product => {

        const matchesGovernorate =
            !selectedGovernorate ||
            product.governorate === selectedGovernorate;

        const matchesType =
            !selectedType ||
            product.type === selectedType;

        return matchesGovernorate && matchesType;

    });

    if (filteredProducts.length === 0) {

        const message = document.createElement("p");
        message.className = "empty-products";
        message.textContent = "ما فماش إعلانات حالياً.";

        productsList.appendChild(message);
        return;
    }

    filteredProducts.forEach(product => {

        const card = document.createElement("article");
        card.className = "product-card";

        const title = document.createElement("h3");
        title.textContent = product.title;

        const description = document.createElement("p");
        description.textContent = product.description;

        const typeLabel = document.createElement("span");
        typeLabel.className = "product-type";

        const types = {
            sale: "💰 للبيع",
            wanted: "🔎 نبحث عن حاجة",
            free: "🎁 للتبرّع مجاناً"
        };

        typeLabel.textContent = types[product.type] || "إعلان";

        const price = document.createElement("p");
        price.className = "product-price";

        if (product.type === "free") {
            price.textContent = "مجاني";
        } else if (product.price !== null && product.price !== undefined) {
            price.textContent = `${product.price} د.ت`;
        } else {
            price.textContent = "السعر غير محدد";
        }

        const location = document.createElement("p");
        location.className = "product-location";
        location.textContent =
            `📍 ${product.governorate} - ${product.delegation}`;

        card.append(
            typeLabel,
            title,
            description,
            price,
            location
        );

        productsList.appendChild(card);

    });

}

// =====================================
// 4. FILTER PRODUCTS
// =====================================

filterProductGovernorate.addEventListener(
    "change",
    displayProducts
);

filterProductType.addEventListener(
    "change",
    displayProducts
);

// =====================================
// 5. PUBLISH PRODUCT
// =====================================

productForm.addEventListener("submit", async event => {

    event.preventDefault();

    productSuccess.textContent = "";
    productError.textContent = "";

    const title = productTitle.value.trim();
    const description = productDescription.value.trim();
    const type = productType.value;

    const governorate = productGovernorate.value;
    const delegation = productDelegation.value;

    const priceText = productPrice.value.trim();

    if (!auth.currentUser) {
        productError.textContent =
            "يلزم تسجيل الدخول قبل نشر الإعلان.";
        return;
    }

    if (!title || !description || !type ||
        !governorate || !delegation) {

        productError.textContent =
            "عمّر جميع المعلومات المطلوبة.";
        return;
    }

    let price = null;

    if (type === "sale") {

        if (priceText === "" || !Number.isFinite(Number(priceText)) ||
            Number(priceText) < 0) {

            productError.textContent =
                "حطّ سعر صحيح للحاجة اللي تحب تبيعها.";
            return;
        }

        price = Number(priceText);

    } else if (type === "free") {

        price = 0;

    } else if (priceText !== "") {

        if (!Number.isFinite(Number(priceText)) ||
            Number(priceText) < 0) {

            productError.textContent = "السعر غير صحيح.";
            return;
        }

        price = Number(priceText);

    }

    publishProductButton.disabled = true;
    publishProductButton.textContent = "جاري النشر...";

    try {

        await addDoc(collection(db, "marketplace"), {

            title,
            description,
            type,
            price,
            governorate,
            delegation,

            authorId: auth.currentUser.uid,
            createdAt: serverTimestamp()

        });

        productForm.reset();

        productDelegation.innerHTML =
            '<option value="">اختار المعتمدية</option>';

        productDelegation.disabled = true;

        productSuccess.textContent =
            "تم نشر إعلانك بنجاح ❤️";

    } catch (error) {

        console.error("Publish product error:", error);

        productError.textContent =
            "صار مشكل في نشر الإعلان. حاول مرة أخرى.";

    } finally {

        publishProductButton.disabled = false;
        publishProductButton.textContent = "نشر الإعلان";

    }

});

// =====================================
// 6. LOAD PRODUCTS FROM FIRESTORE
// =====================================

function listenToProducts() {

    onSnapshot(
        collection(db, "marketplace"),

        snapshot => {

            allProducts = [];

            snapshot.forEach(documentSnapshot => {

                allProducts.push({
                    id: documentSnapshot.id,
                    ...documentSnapshot.data()
                });

            });

            allProducts.sort((a, b) => {

                const dateA = a.createdAt?.toMillis?.() || 0;
                const dateB = b.createdAt?.toMillis?.() || 0;

                return dateB - dateA;

            });

            displayProducts();

        },

        error => {

            console.error("Load products error:", error);

            productsList.textContent =
                "تعذّر تحميل الإعلانات. حاول مرة أخرى.";

        }
    );

}

// =====================================
// 7. INITIALIZE
// =====================================

async function initializeMarketplace() {

    try {

        loadGovernorates();

        if (!auth.currentUser) {
            await signInAnonymously(auth);
        }

        listenToProducts();

    } catch (error) {

        console.error("Marketplace initialization error:", error);

        productError.textContent =
            "صار مشكل في الاتصال. حاول مرة أخرى.";

        productsList.textContent =
            "تعذّر الاتصال بالخدمة.";

    }

}

initializeMarketplace();
