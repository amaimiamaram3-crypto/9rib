
import { db, auth } from "./firebase.js";
import { regions } from "./regions.js";

import {
    collection,
    addDoc,
    onSnapshot,
    deleteDoc,
    doc,
    serverTimestamp,
    getDoc,
    setDoc,
    getDocs,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import {
    signInAnonymously
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

// =====================================
// 1. HTML ELEMENTS
// =====================================

const postForm = document.getElementById("postForm");
const postTitle = document.getElementById("postTitle");
const postDescription = document.getElementById("postDescription");

const postGovernorate = document.getElementById("postGovernorate");
const postDelegation = document.getElementById("postDelegation");

const publishButton = document.getElementById("publishButton");
const postSuccess = document.getElementById("postSuccess");
const postError = document.getElementById("postError");

const filterGovernorate = document.getElementById("filterGovernorate");
const filterDelegation = document.getElementById("filterDelegation");
const resetPostFilters = document.getElementById("resetPostFilters");

const postsList = document.getElementById("postsList");
const postsEmpty = document.getElementById("postsEmpty");
const totalPostsElement = document.getElementById("totalPosts");
const totalLikesElement = document.getElementById("totalLikes");
const totalCommentsElement = document.getElementById("totalComments");
const totalRegionsElement = document.getElementById("totalRegions");

let currentUser = null;
let allPosts = [];

const requestedPostId =
    new URLSearchParams(window.location.search).get("post");

let openedRequestedPost = false;

const statsUnsubscribers = new Map();
let statsUpdateVersion = 0;

// =====================================
// 2. DELEGATION NAME
// =====================================

function getDelegationName(item) {
    return item;
}
// =====================================
// NOTIFICATIONS
// =====================================

async function createNotification(recipientId, type, post) {

    // ما نبعثوش إشعار لصاحب المنشور على تفاعله هو
    if (!recipientId || recipientId === currentUser?.uid) {
        return;
    }

    const messages = {
        like: "Un membre aime votre publication ❤️",
        comment: "Un membre a commenté votre publication 💬"
    };

    try {
        await addDoc(
            collection(db, "users", recipientId, "notifications"),
            {
                type: type,
                postId: post.id,
                postTitle: post.title || "",
                message: messages[type],
                senderId: currentUser.uid,
                read: false,
                createdAt: serverTimestamp()
            }
        );

    } catch (error) {
        console.error("Notification error:", error);
    }
}

// =====================================
// 3. LOAD GOVERNORATES
// =====================================

function loadGovernorates() {
    Object.keys(regions).forEach(name => {
        const option1 = document.createElement("option");
        option1.value = name;
        option1.textContent = name;
        postGovernorate.appendChild(option1);

        const option2 = document.createElement("option");
        option2.value = name;
        option2.textContent = name;
        filterGovernorate.appendChild(option2);
    });
}

// =====================================
// 4. LOAD DELEGATIONS
// =====================================

function loadDelegations(governorate, selectElement, defaultText) {
    selectElement.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = defaultText;
    selectElement.appendChild(defaultOption);

    selectElement.disabled = !governorate;

    if (!governorate || !Array.isArray(regions[governorate])) {
        return;
    }

    regions[governorate].forEach(item => {
        const name = getDelegationName(item);

        if (!name) return;

        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        selectElement.appendChild(option);
    });
}

postGovernorate.addEventListener("change", () => {
    loadDelegations(
        postGovernorate.value,
        postDelegation,
        "Choisir une délégation"
    );
});

filterGovernorate.addEventListener("change", () => {
    loadDelegations(
        filterGovernorate.value,
        filterDelegation,
        "Toutes les délégations"
    );

    displayPosts();
});

filterDelegation.addEventListener("change", displayPosts);

// =====================================
// 5. PUBLISH A POST
// =====================================

postForm.addEventListener("submit", async event => {
    event.preventDefault();

    postSuccess.textContent = "";
    postError.textContent = "";

    const title = postTitle.value.trim();
    const description = postDescription.value.trim();
    const governorate = postGovernorate.value;
    const delegation = postDelegation.value;

    if (!title || !description || !governorate || !delegation) {
        postError.textContent = "Veuillez remplir tous les champs.";
        return;
    }

    if (!currentUser) {
        postError.textContent = "Connexion en cours. Réessayez.";
        return;
    }

    publishButton.disabled = true;
    publishButton.textContent = "Publication en cours...";

    try {
        await addDoc(collection(db, "posts"), {
            title,
            description,
            governorate,
            delegation,
            authorId: currentUser.uid,
            createdAt: serverTimestamp()
        });

        postForm.reset();

        loadDelegations(
            "",
            postDelegation,
            "Choisir une délégation"
        );

        postSuccess.textContent = "Votre publication a été publiée avec succès ! ❤️";

    } catch (error) {
        console.error("Publish error:", error);
        postError.textContent = "Impossible de publier. Vérifiez votre connexion.";
    } finally {
        publishButton.disabled = false;
        publishButton.textContent = "Publier ma demande";
    }
});

// =====================================
// 6. DISPLAY POSTS
// =====================================

function displayPosts() {
    postsList.innerHTML = "";

    const selectedGovernorate = filterGovernorate.value;
const selectedDelegation = filterDelegation.value;

const filteredPosts = requestedPostId
    ? allPosts.filter(post => post.id === requestedPostId)
    : allPosts.filter(post => {
        return (!selectedGovernorate ||
                post.governorate === selectedGovernorate) &&
               (!selectedDelegation ||
                post.delegation === selectedDelegation);
    });

    postsEmpty.hidden = filteredPosts.length !== 0;

    if (filteredPosts.length === 0) {
        return;
    }

    filteredPosts.forEach(post => {
        const card = document.createElement("article");
        card.className = "post-card";
        if (post.id === requestedPostId) {
    card.id = "requested-post";
    card.classList.add("highlighted-post");
}
        const title = document.createElement("h3");
        title.textContent = post.title;

        const description = document.createElement("p");
        description.className = "post-description";
        description.textContent = post.description;

        const location = document.createElement("p");
        location.className = "post-location";
        location.textContent =
            "📍 " + post.delegation + ", " + post.governorate;

        const author = document.createElement("p");
        author.className = "post-author";
        author.textContent = "👤 Membre de la communauté 9RIB";

        card.append(title, description, location, author);
        
        // LIKES
        const likesSection = document.createElement("div");
        likesSection.className = "likes-section";

        const likeButton = document.createElement("button");
        likeButton.type = "button";
        likeButton.className = "like-button";

        const likesCount = document.createElement("span");
        likesCount.className = "likes-count";

        likesSection.append(likeButton, likesCount);
        card.appendChild(likesSection);

        const likesRef = collection(db, "posts", post.id, "likes");

        onSnapshot(likesRef, snapshot => {
            const liked = snapshot.docs.some(
                item => item.id === currentUser?.uid
            );

            likeButton.textContent = liked ? "❤️ J’aime" : "🤍 J’aime";
            likesCount.textContent = `${snapshot.size} J’aime`;
            likeButton.classList.toggle("liked", liked);
        });

        likeButton.addEventListener("click", async () => {
            if (!currentUser) return;

            likeButton.disabled = true;

            try {
                const myLikeRef = doc(
                    db, "posts", post.id, "likes", currentUser.uid
                );

            

                const myLike = await getDoc(myLikeRef);

                if (myLike.exists()) {
                    await deleteDoc(myLikeRef);
                } else {
    await setDoc(myLikeRef, {
        authorId: currentUser.uid,
        createdAt: serverTimestamp()
    });

    await createNotification(post.authorId, "like", post);
}
            } catch (error) {
                console.error("Like error:", error);
                alert("Impossible d'enregistrer votre J’aime.");
            } finally {
                likeButton.disabled = false;
            }
        });

        
        // COMMENTS SECTION
        const commentsSection = document.createElement("div");
        commentsSection.className = "comments-section";

        const commentsTitle = document.createElement("h4");
        commentsTitle.textContent = "💬 Commentaires";

        const commentsList = document.createElement("div");
        commentsList.className = "comments-list";
        commentsList.textContent = "Chargement des commentaires...";

        const commentForm = document.createElement("form");
        commentForm.className = "comment-form";

        const commentInput = document.createElement("input");
        commentInput.type = "text";
        commentInput.placeholder = "Écrire un commentaire...";
        commentInput.maxLength = 500;
        commentInput.required = true;

        const commentButton = document.createElement("button");
        commentButton.type = "submit";
        commentButton.textContent = "Envoyer";

        commentForm.append(commentInput, commentButton);

        commentsSection.append(
            commentsTitle,
            commentsList,
            commentForm
        );

        card.appendChild(commentsSection);

        commentForm.addEventListener("submit", async event => {
            event.preventDefault();

            const commentText = commentInput.value.trim();

            if (!commentText || !currentUser) return;

            commentButton.disabled = true;

            try {
                await addDoc(
    collection(db, "posts", post.id, "comments"),
    {
        text: commentText,
        authorId: currentUser.uid,
        createdAt: serverTimestamp()
    }
);

await createNotification(post.authorId, "comment", post);

commentInput.value = "";

            } catch (error) {
                console.error("Comment error:", error);
                alert("Impossible d'envoyer le commentaire.");
            } finally {
                commentButton.disabled = false;
            }
        });

        onSnapshot(
            collection(db, "posts", post.id, "comments"),
            snapshot => {
                commentsList.innerHTML = "";

                if (snapshot.empty) {
                    commentsList.textContent = "Aucun commentaire pour le moment.";
                    return;
                }

                snapshot.forEach(commentDoc => {
                    const comment = commentDoc.data();

                    const commentItem = document.createElement("div");
                    commentItem.className = "comment-item";

                    const commentTextElement = document.createElement("p");
                    commentTextElement.textContent = comment.text;

                    const commentAuthor = document.createElement("small");
                    commentAuthor.textContent = "Membre de la communauté";

                    commentItem.append(commentAuthor, commentTextElement);

                    if (comment.authorId === currentUser?.uid) {
                        const deleteComment = document.createElement("button");
                        deleteComment.type = "button";
                        deleteComment.textContent = "Supprimer";

                        deleteComment.addEventListener("click", async () => {
                            if (!confirm("Supprimer ce commentaire ?")) return;

                            try {
                                await deleteDoc(
                                    doc(db, "posts", post.id, "comments", commentDoc.id)
                                );
                            } catch (error) {
                                console.error(error);
                                alert("Impossible de supprimer le commentaire.");
                            }
                        });

                        commentItem.appendChild(deleteComment);
                    }

                    commentsList.appendChild(commentItem);
                });
            },
            error => {
                console.error("Comments loading error:", error);
                commentsList.textContent = "Impossible de charger les commentaires.";
            }
        );


        if (post.authorId === currentUser?.uid) {
            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "delete-post-button";
            deleteButton.textContent = "Supprimer ma publication";

            deleteButton.addEventListener("click", async () => {
                const confirmed = confirm(
                    "Voulez-vous vraiment supprimer cette publication ?"
                );

                if (!confirmed) return;

                try {
                    await deleteDoc(doc(db, "posts", post.id));
                } catch (error) {
                    console.error("Delete error:", error);
                    alert("Impossible de supprimer cette publication.");
                }
            });

            card.appendChild(deleteButton);
        }

        postsList.appendChild(card);

if (post.id === requestedPostId && !openedRequestedPost) {
    openedRequestedPost = true;

   requestAnimationFrame(() => {
    requestAnimationFrame(() => {
        card.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    });
});
}
    });
}

// =====================================
// 7. LISTEN TO FIRESTORE POSTS
// =====================================


function updateCommunityStats() {
    totalPostsElement.textContent = allPosts.length;

    const regionsCount = new Set(
        allPosts.map(post => post.governorate).filter(Boolean)
    ).size;

    totalRegionsElement.textContent = regionsCount;

    const activePostIds = new Set(allPosts.map(post => post.id));

    // Stop listeners for deleted posts
    for (const [postId, stats] of statsUnsubscribers) {
    if (!activePostIds.has(postId)) {
        stats.unsubscribe();
        statsUnsubscribers.delete(postId);
    }
}
    // Listen to likes and comments for every post
    allPosts.forEach(post => {
        if (statsUnsubscribers.has(post.id)) return;

        let likesCount = 0;
        let commentsCount = 0;

        const updateTotals = () => {
            let totalLikes = 0;
            let totalComments = 0;

            for (const stats of statsUnsubscribers.values()) {
                totalLikes += stats.likes;
                totalComments += stats.comments;
            }

            totalLikesElement.textContent = totalLikes;
            totalCommentsElement.textContent = totalComments;
        };

        const likesUnsubscribe = onSnapshot(
            collection(db, "posts", post.id, "likes"),
            snapshot => {
                const stats = statsUnsubscribers.get(post.id);
                if (!stats) return;

                stats.likes = snapshot.size;
                updateTotals();
            },
            error => console.error("Likes statistics error:", error)
        );

        const commentsUnsubscribe = onSnapshot(
            collection(db, "posts", post.id, "comments"),
            snapshot => {
                const stats = statsUnsubscribers.get(post.id);
                if (!stats) return;

                stats.comments = snapshot.size;
                updateTotals();
            },
            error => console.error("Comments statistics error:", error)
        );

        statsUnsubscribers.set(post.id, {
            likes: likesCount,
            comments: commentsCount,
            unsubscribe: () => {
                likesUnsubscribe();
                commentsUnsubscribe();
            }
        });
    });
}




function listenToPosts() {
    onSnapshot(
        collection(db, "posts"),

        snapshot => {
            allPosts = snapshot.docs.map(document => ({
                id: document.id,
                ...document.data()
            }));

            allPosts.sort((a, b) => {
                const dateA = a.createdAt?.toMillis?.() || 0;
                const dateB = b.createdAt?.toMillis?.() || 0;
                return dateB - dateA;
            });

            updateCommunityStats();
            displayPosts();
        },

        error => {
            console.error("Posts loading error:", error);
            postsList.textContent =
                "Impossible de charger les publications.";
        }
    );
}

// =====================================
// 8. RESET FILTERS
// =====================================

resetPostFilters.addEventListener("click", () => {
    filterGovernorate.value = "";

    loadDelegations(
        "",
        filterDelegation,
        "Toutes les délégations"
    );

    displayPosts();
});

// =====================================
// 9. START COMMUNITY
// =====================================

async function startCommunity() {
    try {
        if (!auth.currentUser) {
            const result = await signInAnonymously(auth);
            currentUser = result.user;
        } else {
            currentUser = auth.currentUser;
        }
        listenToNotifications();
        listenToPosts();

    } catch (error) {
        console.error("Authentication error:", error);
        postsList.textContent =
            "Impossible de se connecter. Vérifiez Firebase Authentication.";
    }
}
// =====================================
// 10. NOTIFICATIONS DISPLAY
// =====================================

const notificationToggle =
    document.getElementById("notificationToggle");

const notificationCount =
    document.getElementById("notificationCount");

const notificationsPanel =
    document.getElementById("notificationsPanel");

const notificationsList =
    document.getElementById("notificationsList");

let notificationsUnsubscribe = null;

function listenToNotifications() {

    if (!currentUser) return;

    if (notificationsUnsubscribe) {
        notificationsUnsubscribe();
    }

    const notificationsRef = collection(
        db,
        "users",
        currentUser.uid,
        "notifications"
    );

    notificationsUnsubscribe = onSnapshot(
        notificationsRef,
        snapshot => {

            const notifications = snapshot.docs.map(item => ({
                id: item.id,
                ...item.data()
            }));

            notifications.sort((a, b) =>
                (b.createdAt?.seconds || 0) -
                (a.createdAt?.seconds || 0)
            );

            const unreadCount =
                notifications.filter(item => !item.read).length;

            notificationCount.textContent = unreadCount;

            notificationsList.innerHTML = "";

            if (notifications.length === 0) {
                notificationsList.textContent =
                    "Aucune notification pour le moment.";
                return;
            }

            notifications.forEach(notification => {

                const item = document.createElement("div");
                item.className = "notification-item";

                if (!notification.read) {
                    item.classList.add("unread");
                }

                const message = document.createElement("p");
                message.textContent = notification.message || "Nouvelle notification";

                const title = document.createElement("small");
                title.textContent = notification.postTitle || "";

                item.append(message, title);

                item.addEventListener("click", async () => {

                    if (!notification.read) {
                        try {
                            await updateDoc(
                                doc(
                                    db,
                                    "users",
                                    currentUser.uid,
                                    "notifications",
                                    notification.id
                                ),
                                { read: true }
                            );
                        } catch (error) {
                            console.error(
                                "Read notification error:",
                                error
                            );
                        }
                    }

                });

                notificationsList.appendChild(item);
            });
        },
        error => {
            console.error("Notifications listener error:", error);
        }
    );
}

notificationToggle?.addEventListener("click", () => {
    notificationsPanel.hidden = !notificationsPanel.hidden;
});

loadGovernorates();

loadDelegations(
    "",
    postDelegation,
    "Choisir une délégation"
);

loadDelegations(
    "",
    filterDelegation,
    "Toutes les délégations"
);

startCommunity();
