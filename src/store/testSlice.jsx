import {createSlice} from "@reduxjs/toolkit";

const user = createSlice({
    name: "user",
    initialState: {name: "kim", age: 20},
    reducers: {
        setUser(state, action) {
            return state.name = "park";
        },
        addAge(state, action) {
            state.age += action.payload;
        }
    }
});
export const {setUser, addAge} = user.actions;
export default user;