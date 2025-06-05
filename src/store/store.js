import {configureStore, createSlice} from "@reduxjs/toolkit";

//test
const test = createSlice({
    name: "test",
    initialState: [
        {id: 0, name: "White and Black", count: 2},
        {id: 2, name: "Grey Yordan", count: 1},
    ],
    reducers: {
        setTest(state, action) {
            state.name = action.payload;
        }
    }
});
export const {setTest} = test.actions;
export default configureStore({
    reducer: {test: test.reducer},
});