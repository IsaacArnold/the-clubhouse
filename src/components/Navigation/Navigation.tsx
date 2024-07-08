import styles from "./Navigation.module.scss";

const Navigation = () => {
  return (
    <nav className={styles.navbar}>
      {/* Image */}
      <a href="/">
        {/* <img
          src={ChandlerLogo}
          alt="Chandler Eagles Futsal logo"
          className={styles.logo}
        /> */}
      </a>

      {/* Mobile nav */}
      <div className={styles.mobileMenu}>
        <div className={styles.mobileMenuHead}>
          <a href="/" className={styles.logoContainer}>
            {/* <img
              src={ChandlerLogo}
              alt="Chandler Eagles Futsal logo"
              className={styles.mobileMenuLogo}
            /> */}
          </a>
          {/* <Icon name="mdi:close" className={styles.close-icon" /> */}
        </div>
        <ul className={styles.mobileUl}>
          <li>
            <a href="/" className={styles.mobileLi}>
              {" "}
              Home
            </a>
          </li>
          <li>
            <a href="/" className={styles.mobileLi}>
              {" "}
              Ladders
            </a>
          </li>
          <li>
            <a href="/" className={styles.mobileLi}>
              {" "}
              Services
            </a>
          </li>
          <li>
            <a href="/" className={styles.mobileLi}>
              {" "}
              Contact
            </a>
          </li>
        </ul>
      </div>

      {/* Desktop nav */}
      <ul className={styles.laptopMenu}>
        <li className={styles.laptopMenuLink}>
          <a href="/">Ladders</a>
        </li>
        <li className={styles.laptopMenuLink}>
          <a href="/">About</a>
        </li>
        <li className={styles.laptopMenuLink}>
          <a href="/">Contact</a>
        </li>
      </ul>

      {/* Hamburger icon */}
      {/* <Icon name="mdi:menu" className={styles.hamburger} /> */}
    </nav>
  );
};
