import styles from "../../../styles/components/ui/CharacteristicWindow/CharacteristicWindow.module.css";

const CharacteristicWindow = ({ icon, characteristic, meaning }) => {
  return (
    <div className={styles["characteristicWindow-container"]}>
      {icon}
      <div className={styles["characteristicWindow-parametr"]}>
        <p>{characteristic}</p>
      </div>
      <div className={styles["characteristicWindow-meaning"]}>
        <span>{meaning} {characteristic === "FEELS LIKE" && ('°')}</span>
      </div>
    </div>
  );
};

export default CharacteristicWindow;
