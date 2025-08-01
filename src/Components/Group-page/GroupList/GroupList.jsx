import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '../../../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import GroupItem from '../GroupItem/GroupItem.jsx';
import styles from './GroupList.module.css';

function GroupList() {
    const [user] = useAuthState(auth);
    const [allGroups, setAllGroups] = useState([]);
    const [userLocation, setUserLocation] = useState('');
    const navigate = useNavigate();

    const fetchGroups = useCallback(async () => {
        if (!user) return;

        try {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            const userLocation = userSnap.data().location;
            setUserLocation(userLocation);

            const querySnapshot = await getDocs(collection(db, 'groups'));
            const filteredGroups = querySnapshot.docs
                .map((doc) => ({ id: doc.id, ...doc.data() }))
                .filter((group) => group.location === userLocation);

            setAllGroups(filteredGroups);
        } catch (err) {
            console.error('모임 불러오기 실패:', err.message);
        }
    }, [user]);

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>{userLocation} 모임</h2>
            {allGroups.length === 0 ? (
                <p className={styles.empty}>모임이 없습니다.</p>
            ) : (
                <div >
                    {allGroups.map((group) => (
                        <GroupItem key={group.id} group={group} user={user} />
                    ))}
                </div>
            )}

            <button
                className={styles.fab}
                onClick={() => navigate('/home/group/create')}
            >
                +
            </button>

        </div>
    );

}

export default GroupList;
