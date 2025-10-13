import {createSlice, PayloadAction} from "@reduxjs/toolkit"
import { RootState } from "./store";

interface AuthState {
    user: object | null;
    isVisitor: boolean;
}

const initialState: AuthState = {
    user: null,
    isVisitor: false,
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
        VisitorState: (state, action: PayloadAction<boolean>) => {
            state.isVisitor = action.payload;
        }
    },
});

export const { loginState, logoutState, VisitorState } = authState.actions;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsVisitor = (state: RootState) => state.auth.isVisitor;

export default authState.reducer;