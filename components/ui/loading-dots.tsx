import styles from "./loading-dots.module.css";

interface LoadingDotsProps {
  color?: string;
}

const LoadingDots = ({ color }: LoadingDotsProps) => {
  return (
    <span className={styles.loading}>
      <span style={{ backgroundColor: color ?? 'var(--primary)' }} />
      <span style={{ backgroundColor: color ?? 'var(--primary)' }} />
      <span style={{ backgroundColor: color ?? 'var(--primary)' }} />
    </span>
  );
};

export default LoadingDots;
