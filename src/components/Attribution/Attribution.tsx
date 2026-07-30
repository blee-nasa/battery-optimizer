interface AttributionProps {
  firstName: string
  lastName: string
  email: string
}

export const Attribution = ({ firstName, lastName, email }: AttributionProps) => {
  return <span>{`${firstName} ${lastName} <${email}>`}</span>
}
