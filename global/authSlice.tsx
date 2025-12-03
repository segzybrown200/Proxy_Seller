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
        updateUserState: (state, action: PayloadAction<{name?: string; email?: string; phone?: string}>) => {
            if (state.user) {
                const currentUser = state.user as any;
                state.user = {
                    ...currentUser,
                    user: {
                        id: currentUser.user.id,
                        email: action.payload.email || currentUser.user.email,
                        name: action.payload.name || currentUser.user.name,
                        phone: action.payload.phone || currentUser.user.phone,
                        vendorApplicationId: currentUser.user.vendorApplicationId,
                        vendorStatus: currentUser.user.vendorStatus
                    }
                };
            }
        }
    },
});

export const { loginState, logoutState,updateUserState } = authState.actions;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsVisitor = (state: RootState) => state.auth.isVisitor;

export default authState.reducer;