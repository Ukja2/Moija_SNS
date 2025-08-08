// src/Components/features/groups/MyGroups.jsx
import React, { useEffect, useState } from "react";
import { db, auth } from "../../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import styles from "./Mygroups.module.css";

function MyGroups() {
  const [user] = useAuthState(auth);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleDelete = async (groupId) => {
    if (!window.confirm("정말 이 모임을 삭제하시겠어요?")) return;
    try {
      await deleteDoc(doc(db, "groups", groupId));
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
    } catch (err) {
      console.error("모임 삭제 실패:", err);
      alert("모임 삭제에 실패했습니다.");
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchMyGroups = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "groups"),
          where("creatorId", "==", user.uid)
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setGroups(list);
      } catch (err) {
        console.error("내가 만든 모임 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyGroups();
  }, [user]);

  if (!user) return <div className={styles.wrapper}>로그인이 필요합니다.</div>;
  if (loading) return <div className={styles.wrapper}>불러오는 중...</div>;

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow}>
        <h3 className={styles.title}>내가 만든 모임</h3>
      </div>

      {groups.length === 0 ? (
        <div className={styles.empty}>아직 만든 모임이 없어요.</div>
      ) : (
        <ul className={styles.list}>
          {groups.map((g) => (
            <li key={g.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h4 className={styles.cardTitle}>{g.title || "제목 없음"}</h4>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(g.id)}
                >
                  삭제
                </button>
              </div>

              <p className={styles.desc}>
                {g.description || "설명이 없습니다."}
              </p>

              <div className={styles.meta}>
                <span>일정: {g.date || "-"}</span>
                <span>장소: {g.meetingplace || "-"}</span>
              </div>

              <div className={styles.count}>
                {Array.isArray(g.members) ? g.members.length : 0}명 참여중
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MyGroups;
