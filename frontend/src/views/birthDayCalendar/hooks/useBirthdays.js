import { useCallback } from 'react';
import { useBirthdayContext } from '../context/BirthdayContext';
import {
  getBirthdaysByUserId,
  getUpcomingBirthdays,
  createBirthday,
  updateBirthday,
  removeBirthday,
} from '../../../services/birthdayService';
import {
  LOAD_BIRTHDAYS,
  ADD_BIRTHDAY,
  UPDATE_BIRTHDAY,
  DELETE_BIRTHDAY,
  SET_NOTIFICATIONS,
} from '../context/birthdayReducer';

/**
 * useBirthdays
 *
 * Encapsulates all data-fetching & mutation logic.
 * Components call these actions — no direct service imports needed in UI.
 */
const useBirthdays = (userId) => {
  const { dispatch } = useBirthdayContext();

  const loadBirthdays = useCallback(async () => {
    const res = await getBirthdaysByUserId(userId);
    if (res?.data) dispatch({ type: LOAD_BIRTHDAYS, payload: res.data });
  }, [userId, dispatch]);

  const loadNotifications = useCallback(async () => {
    const res = await getUpcomingBirthdays(userId, 7);
    if (res?.data) dispatch({ type: SET_NOTIFICATIONS, payload: res.data });
  }, [userId, dispatch]);

  const addBirthday = useCallback(
    async (formData) => {
      // Optimistic: add a temporary placeholder while request is in-flight
      const res = await createBirthday(userId, formData);
      if (res?.data) dispatch({ type: ADD_BIRTHDAY, payload: res.data });
      return res?.data;
    },
    [userId, dispatch],
  );

  const editBirthday = useCallback(
    async (id, formData) => {
      const res = await updateBirthday(id, formData);
      if (res?.data) dispatch({ type: UPDATE_BIRTHDAY, payload: res.data, id: id });
      return res?.data;
    },
    [dispatch],
  );

  const deleteBirthday = useCallback(
    async (id) => {
      await removeBirthday(id);
      dispatch({ type: DELETE_BIRTHDAY, payload: id });
    },
    [dispatch],
  );

  return { loadBirthdays, loadNotifications, addBirthday, editBirthday, deleteBirthday };
};

export default useBirthdays;
