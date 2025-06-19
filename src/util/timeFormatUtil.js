import {formatDistanceToNow} from "date-fns";
import {ko} from "date-fns/locale";

//시간을 한국어로 변경하는 함수
export function formatRelativeTimeKo(date) {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();

    const oneMinute = 60 * 1000;

    if (diff < oneMinute) {
        return "방금 전";
    }

    return formatDistanceToNow(new Date(date), {addSuffix: true, locale: ko});
}
