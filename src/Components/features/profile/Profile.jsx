import React, { useEffect, useState } from "react";
import { db, auth } from "../../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";
import {
    doc,
    getDoc,
    collection,
    getDocs,
    query,
    where,
    onSnapshot,
} from "firebase/firestore";

import styles from "./Profile.module.css";
import BottomNav from "../common/BottomNav";
import { useNavigate } from "react-router-dom";
import { FaBell, FaUserCircle } from "react-icons/fa";

function Profile() {
    const [user] = useAuthState(auth);
    const [userNickname, setUserNickname] = useState("");
    const [userLocation, setUserLocation] = useState("");
    const [hasNotification, setHasNotification] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;

        const userRef = doc(db, "users", user.uid);
        const appQuery = query(collection(db, "applications"), where("toUserId", "==", user.uid));
        const groupQuery = query(collection(db, "groups"), where("creatorId", "==", user.uid));

        const unsubscribe = onSnapshot(appQuery, (snapshot) => {
            setHasNotification(!snapshot.empty);
        });

        async function fetchUserData() {
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const data = userSnap.data();
                setUserNickname(data.nickname);
                setUserLocation(data.location);
            }

            
            await getDocs(groupQuery); 
            await getDocs(appQuery);   
        }

        fetchUserData();

        return () => unsubscribe();
    }, [user]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/");
        } catch (err) {
            console.error("로그아웃 실패:", err.message);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.contentArea}>
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>프로필</h3>
                    <p><strong>닉네임:</strong> {userNickname}</p>
                    <p><strong>지역:</strong> {userLocation}</p>
                </div>

                <div className={styles.notificationWrapper} onClick={() => navigate("/home/profile/notifications")}>
                    <div className={styles.notificationTab}>
                        <span>받은 모임 신청</span>
                        <div className={styles.iconWrapper}>
                            <FaBell className={styles.bellIcon} />
                            {hasNotification && <span className={styles.badge} />}
                        </div>
                    </div>
                </div>

                <div className={styles.notificationWrapper} onClick={() => navigate("/home/profile/myposts")}>
                    <div className={styles.notificationTab}>
                        <span>내가 쓴 게시물</span>
                        <FaUserCircle className={styles.bellIcon} />
                    </div>
                </div>

                <button onClick={handleLogout} className={styles.logoutBtn}>로그아웃</button>
            </div>

            <BottomNav />
        </div>
    );
}

export default Profile;
