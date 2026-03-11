export function checkUserLocation(onSuccess, onError) {
    if (!("geolocation" in navigator)) {
        onError({
            type: "UNSUPPORTED",
            message: "Geolocation is not supported by your browser.",
        });
        return null;
    }

    const watchId = navigator.geolocation.watchPosition(
        (position) => {
            onSuccess(position);
        },
        (error) => {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    onError({
                        type: "DENIED",
                        message: "Location permission denied. Please enable it.",
                    });
                    break;

                case error.POSITION_UNAVAILABLE:
                    onError({
                        type: "UNAVAILABLE",
                        message: "Location services are turned off.",
                    });
                    break;

                case error.TIMEOUT:
                    onError({
                        type: "TIMEOUT",
                        message: "Location request timed out.",
                    });
                    break;

                default:
                    onError({
                        type: "UNKNOWN",
                        message: "An unknown error occurred.",
                    });
            }
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 15000,
        }
    );

    return watchId;
}

// export function checkUserLocation(onSuccess, onError) {
//     if (!("geolocation" in navigator)) {
//         onError({
//             type: "UNSUPPORTED",
//             message: "Geolocation is not supported by your browser.",
//         });
//         return;
//     }

//     navigator.geolocation.getCurrentPosition(
//         (position) => {
//             onSuccess(position);
//         },
//         (error) => {
//             switch (error.code) {
//                 case error.PERMISSION_DENIED:
//                     onError({
//                         type: "DENIED",
//                         message: "Location permission denied. Please enable it.",
//                     });
//                     break;

//                 case error.POSITION_UNAVAILABLE:
//                     onError({
//                         type: "UNAVAILABLE",
//                         message: "Location services are turned off.",
//                     });
//                     break;

//                 case error.TIMEOUT:
//                     onError({
//                         type: "TIMEOUT",
//                         message: "Location request timed out.",
//                     });
//                     break;

//                 default:
//                     onError({
//                         type: "UNKNOWN",
//                         message: "An unknown error occurred.",
//                     });
//             }
//         },
//         {
//             enableHighAccuracy: true,
//             timeout: 8000,
//             maximumAge: 0,
//         }
//     );
// }