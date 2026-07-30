import { Attribution, Panel, TopoMap } from '@components'
import styles from './About.module.css'

const contributors = [
  { firstName: 'Brandon', lastName: 'Lee', email: 'brandon.lee@nasa.gov' },
  { firstName: 'Vesselin', lastName: 'Yamakov', email: 'vesselin.i.yamakov@nasa.gov' },
]

export const About = () => {
  return (
    <Panel className={styles.about}>
      <div className={styles.content}>
        <section>
          <h4 className={styles.heading}>Purpose</h4>
          <p className={styles.blurb}>
            A web-based calculator for optimizing the construction of solid state batteries.
            Engineers and researchers enter powder component parameters and receive calculated
            outputs, primarily specific capacity (mAh/g), utilization, and mass loading, to
            guide material selection decisions.
          </p>
        </section>

        <section>
          <h4 className={styles.heading}>Contributors</h4>
          <ul className={styles.contributors}>
            {contributors.map((person) => (
              <li key={person.email}>
                <Attribution {...person} />
              </li>
            ))}
          </ul>
        </section>

        <p className={styles.version}>Version {__APP_VERSION__}</p>
      </div>

      <TopoMap className={styles.topo} />
    </Panel>
  )
}
