import React from "react";
import clouds022 from "./clouds-02-2.png";
import clouds023 from "./clouds-02-3.png";
import clouds024 from "./clouds-02-4.png";
import clouds025 from "./clouds-02-5.png";
import clouds02 from "./clouds-02.png";
import clouds042 from "./clouds-04-2.png";
import clouds043 from "./clouds-04-3.png";
import clouds044 from "./clouds-04-4.png";
import clouds04 from "./clouds-04.png";
import image from "./image.png";
import "./cloud.css";

export const Frame = () => {
    return (
        <div className="frame">
            <div className="overlap-group-wrapper">
                <div className="overlap-group">
                    <img className="clouds" alt="Clouds" src={clouds04} />

                    <img className="img" alt="Clouds" src={image} />

                    <img className="clouds-2" alt="Clouds" src={clouds042} />

                    <img className="clouds-3" alt="Clouds" src={clouds043} />

                    <img className="clouds-4" alt="Clouds" src={clouds044} />

                    <img className="clouds-5" alt="Clouds" src={clouds02} />

                    <img className="clouds-6" alt="Clouds" src={clouds022} />

                    <img className="clouds-7" alt="Clouds" src={clouds023} />

                    <img className="clouds-8" alt="Clouds" src={clouds024} />

                    <img className="clouds-9" alt="Clouds" src={clouds025} />
                </div>
            </div>
        </div>
    );
};
