import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export const startHelpTour = (steps) => {
    const driverObj = driver({
        showProgress: true,
        nextBtnText: 'Siguiente',
        prevBtnText: 'Anterior',
        doneBtnText: 'Terminar',
        progressText: 'Paso {{current}} de {{total}}',
        onCloseClick: () => {
            driverObj.destroy();
        },
    });

    driverObj.setSteps(steps);
    driverObj.drive();
};

const HelpTour = ({ steps, onFinish }) => {
    useEffect(() => {
        const driverObj = driver({
            showProgress: true,
            nextBtnText: 'Siguiente',
            prevBtnText: 'Anterior',
            doneBtnText: 'Terminar',
            progressText: 'Paso {{current}} de {{total}}',
            onDestroyed: () => {
                if (onFinish) onFinish();
            },
        });

        driverObj.setSteps(steps);
        driverObj.drive();

        return () => {
            driverObj.destroy();
        };
    }, [steps, onFinish]);

    return null;
};

export default HelpTour;
