export const statusTone = (
  status: string | undefined,
): 'gray' | 'green' | 'red' | 'amber' | 'purple' | 'blue' | 'teal' => {
  switch (status) {
    case 'delivered':
    case 'active':
      return 'green'
    case 'cancelled':
    case 'suspended':
    case 'rejected':
      return 'red'
    case 'pending':
    case 'preparing':
      return 'amber'
    case 'ready':
    case 'arrived':
    case 'accepted':
      return 'blue'
    case 'picked_up':
    case 'in_transit':
      return 'teal'
    default:
      return 'gray'
  }
}
