import {createSlice, PayloadAction} from "@reduxjs/toolkit"
import { RootState } from "./store";

interface AuthState {
    user: object | null;

}

const initialState: AuthState = {
    user: null,
};

const authState = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginState: (state, action: PayloadAction<object>) => {
            state.user = action.payload;
        },
        logoutState: (state) => {
            state.user = null;
        },
    },
});

export const { loginState, logoutState } = authState.actions;
export const selectUser = (state: RootState) => state.auth.user;

export default authState.reducer;