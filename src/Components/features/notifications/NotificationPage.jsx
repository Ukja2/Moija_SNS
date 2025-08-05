import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  deleteDoc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../../firebase";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import styles from "./NotificationPage.module.css";

function NotificationPage() {
  const [user] = useAuthState(auth);
  const [receivedApplications, setReceivedApplications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    async function fetchApplications() {
      const appQuery = query(
        collection(db, "applications"),
        where("toUserId", "==", user.uid)
      );
      const appSnap = await getDocs(appQuery);

      const appList = await Promise.all(
        appSnap.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const groupRef = doc(db, "groups", data.groupId);
          const groupSnap = await getDoc(groupRef);
          const groupTitle = groupSnap.exists()
            ? groupSnap.data().title
            : "알 수 없는 모임";

          return {
            id: docSnap.id,
            ...data,
            groupTitle,
          };
        })
      );

      setReceivedApplications(appList);
    }

    fetchApplications();
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
    setReceivedApplications((prev) => prev.filter((a) => a.id !== app.id));
  }

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.backButton} onClick={handleBack}>
          <FiArrowLeft className={styles.backIcon} />
          <span className={styles.backText}>받은 모임 신청</span>
        </div>
      </div>

      {receivedApplications.length > 0 ? (
        receivedApplications.map((app) => (
          <div key={app.id} className={styles.card}>
            <p className={styles.groupTitle}>모임:  {app.groupTitle}</p>
            <p>{app.intro}</p>
            <div className={styles.buttons}>
              <button
                onClick={() => handleDecision(app, "accepted")}
                className={styles.acceptBtn}
              >
                수락
              </button>
              <button
                onClick={() => handleDecision(app, "rejected")}
                className={styles.rejectBtn}
              >
                거절
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className={styles.emptyState}>
          <p>아직 도착한 신청이 없어요.</p>
          <p className={styles.subText}>
            모임을 만들고 친구들의 신청을 기다려보세요!
          </p>
        </div>
      )}
    </div>
  );
}

export default NotificationPage;
