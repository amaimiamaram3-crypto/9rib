
import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const localNewsList = document.getElementById("localNewsList");

async function loadLocalNews() {
    if (!localNewsList) return;

    try {
        const savedLocation = localStorage.getItem("userLocation");

        if (!savedLocation) {
            localNewsList.textContent =
                "اختار منطقتك أولاً باش تشوف المنشورات القريبة منك.";

            return;
        }

        const location = JSON.parse(savedLocation);

        const governorate = location.governorate;
        const delegation = location.delegation;

        if (!governorate || !delegation) {
            localNewsList.textContent =
                "اختار الولاية والمعتمدية متاعك أولاً.";

            return;
        }

        const snapshot = await getDocs(collection(db, "posts"));

        const posts = [];

        snapshot.forEach(documentSnapshot => {
            const post = {
                id: documentSnapshot.id,
                ...documentSnapshot.data()
            };

            if (
                post.governorate === governorate &&
                post.delegation === delegation
            ) {
                posts.push(post);
            }
        });

        posts.sort((a, b) => {
            const dateA = a.createdAt?.toMillis?.() || 0;
            const dateB = b.createdAt?.toMillis?.() || 0;

            return dateB - dateA;
        });

        localNewsList.replaceChildren();

        if (posts.length === 0) {
            const message = document.createElement("p");
            message.className = "local-news-message";
            message.textContent =
                "ما فماش منشورات في منطقتك توّا.";

            localNewsList.appendChild(message);
            return;
        }

        posts.slice(0, 5).forEach(post => {
            const card = document.createElement("article");
            card.className = "local-news-card";

            const title = document.createElement("h3");
            title.textContent = post.title || "بدون عنوان";

            const description = document.createElement("p");
            description.textContent = post.description || "";

            const region = document.createElement("div");
            region.className = "local-news-location";
            region.textContent =
                `📍 ${post.governorate} - ${post.delegation}`;

            const link = document.createElement("a");
            link.className = "local-news-link";
            link.href = `community.html?post=${encodeURIComponent(post.id)}`;
            link.textContent = "اكتشف المجتمع ←";

            card.append(title, description, region, link);
            localNewsList.appendChild(card);
        });

    } catch (error) {
        console.error("Erreur chargement des actualités :", error);

        localNewsList.textContent =
            "صار مشكل في تحميل المنشورات. حاول مرة أخرى.";
    }
}

loadLocalNews();
