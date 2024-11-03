import { SignIn } from "@clerk/nextjs";
import styles from './page.module.css';

export default function SignInPage() {
  return (
    <div className={styles.container}>
      <div className={styles.signInBox}>
        <SignIn signUpUrl="sign-up" />
      </div>
      <div className={styles.imageWrapper}>
        <img src="writing.png" alt="Drawing of an individual writing in their journal" className={styles.image} />
      </div>
    </div>
  );
}
