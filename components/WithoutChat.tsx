import React from "react";
import styles from "../styles/withoutChat.module.css";

const WithoutChat = () => {
  return (
    <div className={`${styles.container} `}>
      <div className={styles.img}>
        <img
          src="/intro-connection-light_c98cc75f2aa905314d74375a975d2cf2.jpg"
          alt=""
        />
      </div>
      <div className={styles.text}>
        <h1>Keep your phone connected</h1>
        <p>
          WhatsApp connects to your phone to sync messages. To reduce data
          usage, connect your phone to Wi-Fi.
        </p>
      </div>
    </div>
  );
};

export default WithoutChat;
