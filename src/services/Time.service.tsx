
export function millisToMinutesAndSeconds(millis: number) {
    let seconds = ((millis % 60000) / 1000);
    return `${Math.floor(millis / 60000)}:${(seconds < 10 ? "0" : "")}${Math.floor(seconds)}`;
}

export function calcDaysApart(unixMillis1: number, unixMillis2: number): number {
    let d1 = new Date(unixMillis1);
    let d2 = new Date(unixMillis2);
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    return Math.round((d2.getTime() - d1.getTime())/(1000*60*60*24));
}

export function formatDaysApart(daysApart: number): string | undefined {
    if (daysApart <= 0) {
        return undefined;
    } else if (daysApart < 7) {
        return daysApart + " day" + (daysApart > 1 ? "s" : "");
    } else if (daysApart < 30) {
        let week = Math.round(daysApart / 7);
        return week + " week" + (week > 1 ? "s" : "");
    } else if (daysApart < 365) {
        let month = Math.round(daysApart / 30);
        return month + " month" + (month > 1 ? "s" : ""); 
    } else {
        let year = Math.round(daysApart / 365);
        return year + " year" + (year > 1 ? "s" : "");
    }
}

export function formatTime(unixMillis: number): string {
    let date = new Date(unixMillis);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    return (hours % 12 ? hours % 12 : 12) + ':' + (minutes < 10 ? '0'+minutes : minutes) + ' ' + (hours >= 12 ? 'PM' : 'AM');
}

export function formatDateIndicator(unixMillis: number): string {
    let date = new Date(unixMillis);
    let formattedDate = "";
    switch (date.getMonth()) {
        case 0:
            formattedDate += "JAN";
            break;
        case 1:
            formattedDate += "FEB";
            break;
        case 2:
            formattedDate += "MAR";
            break;
        case 3:
            formattedDate += "APR";
            break;
        case 4:
            formattedDate += "MAY";
            break;
        case 5:
            formattedDate += "JUN";
            break;
        case 6:
            formattedDate += "JUL";
            break;
        case 7:
            formattedDate += "AUG";
            break;
        case 8:
            formattedDate += "SEP";
            break;
        case 9:
            formattedDate += "OCT";
            break;
        case 10:
            formattedDate += "NOV";
            break;
        case 11:
            formattedDate += "DEC";
            break;
    }
    return formattedDate + (" " + date.getDate());
}

// export function formatTime(unixMillis: number): string {
//     let date = new Date(unixMillis);
//     let daysApart: number = calcDaysApart(date, new Date())
//     let formattedDate: string = " " + date.toLocaleTimeString()
//     formattedDate = formattedDate.substring(0, formattedDate.length - 3);
//     if (daysApart == 0) {
//         formattedDate = "Today at" + formattedDate;
//     } else if (daysApart == 1) {
//         formattedDate = "Yesterday at" + formattedDate;
//     } else if (daysApart <= 7) {
//         formattedDate = daysApart + " days ago" + formattedDate;
//     } else {
//         formattedDate = date.toLocaleDateString() + formattedDate;
//     }
//     return formattedDate;
// }