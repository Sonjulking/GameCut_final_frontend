import {useDeferredValue, useState, useTransition} from "react";

let a = new Array(10000).fill(0);

function TestTransition() {
    const [name, setName] = useState("");
    const [isPending, 늦게처리] = useTransition();
    //늦게 처리할 스테이트
    //const state = useDeferredValue(state);
    return (
            <div>
                <input
                        onChange={(e) => {
                            늦게처리(() => {
                                setName(e.target.value);
                            });
                        }}

                />
                {
                    isPending ? "로딩중" :
                            a.map(() => {
                                return (
                                        <div>{name}</div>
                                );
                            })
                }
            </div>
    );
}

export default TestTransition;