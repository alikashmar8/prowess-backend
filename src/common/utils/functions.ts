import { AddressesLevel } from 'src/addresses/enums/addresses.enum';
import { Plan } from 'src/plans/plan.entity';
import { UserRoles } from 'src/users/enums/user-roles.enum';

export function removeSpecialCharacters(text: string): string {
  return text.replace(/[`\s~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
}

export function paginateResponse(data, page, limit) {
  const [result, total] = data;
  const lastPage = Math.ceil(total / limit);
  const nextPage = page + 1 > lastPage ? null : page + 1;
  const prevPage = page - 1 < 1 ? null : page - 1;
  return {
    statusCode: 'success',
    data: [...result],
    count: total,
    currentPage: page,
    nextPage: nextPage,
    prevPage: prevPage,
    lastPage: lastPage,
  };
}

export function getAddressesRelationsList(maxLocationLevel: AddressesLevel) {
  let relations = [];
  switch (maxLocationLevel) {
    case AddressesLevel.LEVEL5:
      relations = [
        ...relations,
        ...[
          'address',
          'address.parent',
          'address.parent.parent',
          'address.parent.parent.parent',
          'address.parent.parent.parent.parent',
        ],
      ];
      break;
    case AddressesLevel.LEVEL4:
      relations = [
        ...relations,
        ...[
          'address',
          'address.parent',
          'address.parent.parent',
          'address.parent.parent.parent',
        ],
      ];
      break;
    case AddressesLevel.LEVEL3:
      relations = [
        ...relations,
        ...['address', 'address.parent', 'address.parent.parent'],
      ];
      break;
    case AddressesLevel.LEVEL2:
      relations = [...relations, ...['address', 'address.parent']];
      break;
    case AddressesLevel.LEVEL1:
      relations = [...relations, ...['address']];
      break;
  }
  return relations;
}

export function getAddressesRelationsListWithUserKeyword(
  maxLocationLevel: AddressesLevel,
) {
  let relations = [];
  switch (maxLocationLevel) {
    case AddressesLevel.LEVEL5:
      relations = [
        ...relations,
        ...[
          'user.address',
          'user.address.parent',
          'user.address.parent.parent',
          'user.address.parent.parent.parent',
          'user.address.parent.parent.parent.parent',
        ],
      ];
      break;
    case AddressesLevel.LEVEL4:
      relations = [
        ...relations,
        ...[
          'user.address',
          'user.address.parent',
          'user.address.parent.parent',
          'user.address.parent.parent.parent',
        ],
      ];
      break;
    case AddressesLevel.LEVEL3:
      relations = [
        ...relations,
        ...[
          'user.address',
          'user.address.parent',
          'user.address.parent.parent',
        ],
      ];
      break;
    case AddressesLevel.LEVEL2:
      relations = [...relations, ...['user.address', 'user.address.parent']];
      break;
    case AddressesLevel.LEVEL1:
      relations = [...relations, ...['user.address']];
      break;
  }
  return relations;
}

export function employeeValid(
  expiryDate: any,
  isActive: boolean,
  role: UserRoles,
): boolean {
  if (!isActive) return false;
  if (role == UserRoles.ADMIN) return true;
  if (!expiryDate) return false;
  const expiry = new Date(expiryDate);
  const today = new Date();
  return expiry < today;
}

export function getPlansTotal(plans: Plan[]): any {
  let total = 0;
  plans.forEach((plan) => {
    console.log(plan.price);
    total += Number(plan.price);
    console.log(total);
  });
  console.log('returning total: ', total);
  
  return total;
}
