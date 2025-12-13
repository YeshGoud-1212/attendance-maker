// bunkCalculator.js

function nextDate(date) {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    return d;
}

function isSecondOrFourthSaturday(date) {
    if (date.getDay() !== 6) return false;
    const d = date.getDate();
    return (d >= 8 && d <= 14) || (d >= 22 && d <= 28);
}

function isHoliday(date, holidays) {
    const iso = date.toISOString().split("T")[0];
    return holidays.includes(iso);
}

export function calculateRemainingClasses(timetable, semesterEndStr, holidays = []) {
    const week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const today = new Date();
    let startDate = new Date(today);

    if (today.getHours() >= 17) {
        startDate = nextDate(startDate);
    }

    const semesterEnd = new Date(semesterEndStr);
    let temp = new Date(startDate);
    let end = nextDate(semesterEnd);

    let remaining = 0;

    while (temp < end) {
        const name = week[temp.getDay()];
        if (
            name !== "Sun" &&
            !(name === "Sat" && isSecondOrFourthSaturday(temp)) &&
            !isHoliday(temp, holidays)
        ) {
            remaining += timetable[name] || 0;
        }
        temp = nextDate(temp);
    }

    return { remainingClasses: remaining, startDate };
}

export function calculateBunksAndReachability({ pastAttended, pastTotal, remainingClasses, targetPercent }) {
    let bunkable = 0;

    for (let b = 0; b <= remainingClasses; b++) {
        const newAtt = pastAttended + (remainingClasses - b);
        const newTotal = pastTotal + remainingClasses;

        const percent = (newAtt / newTotal) * 100;
        if (percent >= targetPercent) bunkable = b;
    }

    if (bunkable >= 5) bunkable -= 2;

    const maxPossible =
        ((pastAttended + remainingClasses) / (pastTotal + remainingClasses)) * 100;

    return {
        bunkable,
        reachable: maxPossible >= targetPercent,
        neededToReach: "Compute if required",
        maxPossibleAttendance: maxPossible.toFixed(2)
    };
}

export function simulateBunk(pastAttended, pastTotal, remainingClasses, count) {
    const attended = pastAttended + Math.max(0, remainingClasses - count);
    const total = pastTotal + remainingClasses;
    return ((attended / total) * 100).toFixed(2);
}
