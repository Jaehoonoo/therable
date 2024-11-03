import { SignIn } from "@clerk/nextjs";
import styles from './page.module.css';

export default function SignInPage() {
  return (
    <div className={styles.container}>
      <div className={styles.signInBox}>
        <SignIn signUpUrl="sign-up" />
      </div>
      <div className={styles.imageWrapper}>
        <img src="oldman.png" alt="Image of an older individual thinking of what to write in his journal" className={styles.image} />
      </div>
    </div>
  );
}
