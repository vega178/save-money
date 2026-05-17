// ── Action Types ─────────────────────────────────────────────────────────────
export const LOAD_BIRTHDAYS      = 'LOAD_BIRTHDAYS';
export const ADD_BIRTHDAY        = 'ADD_BIRTHDAY';
export const UPDATE_BIRTHDAY     = 'UPDATE_BIRTHDAY';
export const DELETE_BIRTHDAY     = 'DELETE_BIRTHDAY';
export const SET_VIEW_MONTH      = 'SET_VIEW_MONTH';
export const OPEN_ADD_MODAL      = 'OPEN_ADD_MODAL';
export const CLOSE_ADD_MODAL     = 'CLOSE_ADD_MODAL';
export const OPEN_DETAILS        = 'OPEN_DETAILS';
export const CLOSE_DETAILS       = 'CLOSE_DETAILS';
export const SLIDE_NEXT          = 'SLIDE_NEXT';
export const SLIDE_PREV          = 'SLIDE_PREV';
export const SET_NOTIFICATIONS   = 'SET_NOTIFICATIONS';
export const DISMISS_NOTIFICATION = 'DISMISS_NOTIFICATION';
export const OPEN_EDIT_MODAL     = 'OPEN_EDIT_MODAL';
export const CLOSE_EDIT_MODAL    = 'CLOSE_EDIT_MODAL';

// ── Initial State ─────────────────────────────────────────────────────────────
const now = new Date();

export const initialState = {
  birthdays: [],                 // Birthday[]
  viewMonth: {
    year: now.getFullYear(),
    month: now.getMonth(),       // 0-indexed
  },
  isAddModalOpen: false,
  isEditModalOpen: false,
  editingBirthday: null,     // Birthday being edited
  isDetailsModalOpen: false,
  detailsTarget: null,           // { dayBirthdays: Birthday[], activeIndex: number }
  notifications: {
    todayBirthdays: [],
    upcomingBirthdays: [],
  },
};

// ── Reducer ───────────────────────────────────────────────────────────────────
const birthdayReducer = (state, action) => {
  switch (action.type) {

    case LOAD_BIRTHDAYS:
      return { ...state, birthdays: action.payload };

    case ADD_BIRTHDAY:
      return { ...state, birthdays: [...state.birthdays, action.payload] };

    case UPDATE_BIRTHDAY:
      return {
        ...state,
        birthdays: state.birthdays.map((b) =>
          b.id === action.payload.id ? action.payload : b,
        ),
      };

    case DELETE_BIRTHDAY:
      return {
        ...state,
        birthdays: state.birthdays.filter((b) => b.id !== action.payload),
        // close details if the deleted birthday was open
        isDetailsModalOpen: false,
        detailsTarget: null,
      };

    case SET_VIEW_MONTH:
      return { ...state, viewMonth: action.payload };

    case OPEN_ADD_MODAL:
      return { ...state, isAddModalOpen: true };

    case CLOSE_ADD_MODAL:
      return { ...state, isAddModalOpen: false };

    case OPEN_EDIT_MODAL:
      return { ...state, isEditModalOpen: true, editingBirthday: action.payload };

    case CLOSE_EDIT_MODAL:
      return { ...state, isEditModalOpen: false, editingBirthday: null };

    case OPEN_DETAILS:
      return {
        ...state,
        isDetailsModalOpen: true,
        detailsTarget: {
          dayBirthdays: action.payload.dayBirthdays,
          activeIndex: action.payload.initialIndex ?? 0,
        },
      };

    case CLOSE_DETAILS:
      return { ...state, isDetailsModalOpen: false, detailsTarget: null };

    case SLIDE_NEXT: {
      if (!state.detailsTarget) return state;
      const maxIndex = state.detailsTarget.dayBirthdays.length - 1;
      return {
        ...state,
        detailsTarget: {
          ...state.detailsTarget,
          activeIndex: Math.min(state.detailsTarget.activeIndex + 1, maxIndex),
        },
      };
    }

    case SLIDE_PREV: {
      if (!state.detailsTarget) return state;
      return {
        ...state,
        detailsTarget: {
          ...state.detailsTarget,
          activeIndex: Math.max(state.detailsTarget.activeIndex - 1, 0),
        },
      };
    }

    case SET_NOTIFICATIONS:
      return { ...state, notifications: action.payload };

    case DISMISS_NOTIFICATION:
      return {
        ...state,
        notifications: {
          todayBirthdays: state.notifications.todayBirthdays.filter(
            (b) => b.id !== action.payload,
          ),
          upcomingBirthdays: state.notifications.upcomingBirthdays.filter(
            (u) => u.birthday.id !== action.payload,
          ),
        },
      };

    default:
      return state;
  }
};

export default birthdayReducer;
