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
    updateDoc,
    arrayUnion,
    deleteDoc,
    onSnapshot,
} from "firebase/firestore";
import styles from "./Profile.module.css";
import BottomNav from "../common/BottomNav";
import { useNavigate } from "react-router-dom";
import { FaBell } from "react-icons/fa";

function Profile() {
    const [user] = useAuthState(auth);
    const [userNickname, setUserNickname] = useState("");
    const [userLocation, setUserLocation] = useState("");
    const [myGroups, setMyGroups] = useState([]);
    const [receivedApplications, setReceivedApplications] = useState([]);
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
            // 유저 닉네임, 지역 출력
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                setUserNickname(userSnap.data().nickname);
                setUserLocation(userSnap.data().location);
            }

            // 유저가 만든 모임 출력
            const groupSnap = await getDocs(groupQuery);
            setMyGroups(groupSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            // 받은 모임 신청 출력 (최초 1회만)
            const appSnap = await getDocs(appQuery);
            setReceivedApplications(appSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }

        fetchUserData();

        // 언마운트 시 실시간 리스너 해제
        return () => unsubscribe();
    }, [user]);

    async function handleDecision(app, status) {
        if (status === "accepted") {
            const groupRef = doc(db, "groups", app.groupId);
            await updateDoc(groupRef, {
                members: arrayUnion(app.userId),
            });
        }

        const appRef = doc(db, "applications", app.id);
        await deleteDoc(appRef);
        setReceivedApplications(prev => prev.filter(a => a.id !== app.id));
    }

    async function handleLogout() {
        try {
            await signOut(auth);
            navigate("/");
        } catch (err) {
            console.error("로그아웃 실패:", err.message);
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.contentArea}>
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>프로필</h3>
                    <p><strong>닉네임:</strong> {userNickname}</p>
                    <p><strong>지역:</strong> {userLocation}</p>
                </div>

                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>내가 만든 모임</h3>
                    {myGroups.length > 0 ? (
                        myGroups.map(group => (
                            <div key={group.id} className={styles.groupCard}>
                                <p>{group.title}</p>
                            </div>
                        ))
                    ) : (
                        <p>아직 만든 모임이 없습니다.</p>
                    )}
                </div>

                <div className={styles.notificationWrapper} onClick={() => navigate("/home/profile/notifications")}>
                    <div className={styles.notificationTab}>
                        <span>받은 모임 신청</span>
                        <FaBell className={styles.bellIcon} />
                        {hasNotification && <span className={styles.badge} />}
                    </div>
                </div>


                <button onClick={handleLogout} className={styles.logoutBtn}>로그아웃</button>
            </div>

            <BottomNav />
        </div>
    );
}

export default Profile;
