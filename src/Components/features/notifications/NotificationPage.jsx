import React, { useEffect, useState } from "react";
import { db } from "../../../firebase";
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, deleteDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../../firebase";
import styles from "./NotificationPage.module.css";

function NotificationPage() {
    const [user] = useAuthState(auth);
    const [receivedApplications, setReceivedApplications] = useState([]);

    useEffect(() => {
        if (!user) return;

        async function fetchApplications() {
            const appQuery = query(collection(db, "applications"), where("toUserId", "==", user.uid));
            const appSnap = await getDocs(appQuery);
            setReceivedApplications(appSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }

        fetchApplications();
    }, [user]);

    async function handleDecision(app, status) {
        if (status === "accepted") {
            const groupRef = doc(db, "groups", app.groupId);
            await updateDoc(groupRef, {
                members: arrayUnion(app.userId)
            });
        }

        const appRef = doc(db, "applications", app.id);
        await deleteDoc(appRef);
        setReceivedApplications(prev => prev.filter(a => a.id !== app.id));
    }

    return (
        <div className={styles.wrapper}>
            <h2 className={styles.title}>받은 모임 신청</h2>

            {receivedApplications.length > 0 ? (
                receivedApplications.map(app => (
                    <div key={app.id} className={styles.card}>
                        <p>{app.intro}</p>
                        <div className={styles.buttons}>
                            <button onClick={() => handleDecision(app, "accepted")} className={styles.acceptBtn}>수락</button>
                            <button onClick={() => handleDecision(app, "rejected")} className={styles.rejectBtn}>거절</button>
                        </div>
                    </div>
                ))
            ) : (
                <div className={styles.emptyState}>
                    <p> 아직 도착한 신청이 없어요.</p>
                    <p className={styles.subText}>모임을 만들고 친구들의 신청을 기다려보세요!</p>
                </div>
            )}
        </div>
    );

}

export default NotificationPage;
