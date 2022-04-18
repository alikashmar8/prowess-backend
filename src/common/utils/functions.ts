import { AddressesLevel } from 'src/addresses/enums/addresses.enum';
import { Level1Address } from 'src/addresses/level1-addresses/level1-address.entity';
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
    total += Number(plan.price);
  });  
  return total;
}


export function getAddressString(level1Address: Level1Address): string {
  let result: string = '';
  result += level1Address.name;
  if (level1Address.parent) {
    const level2 = level1Address.parent;
    result = level2.name + ', ' + result;
    if (level2.parent) {
      const level3 = level2.parent;
      result = level3.name + ', ' + result;
      if (level3.parent) {
        const level4 = level3.parent;
        result = level4.name + ', ' + result;
        if (level4.parent) {
          const level5 = level4.parent;
          result = level5.name + ', ' + result;
          return result;
        } else {
          return result;
        }
      } else {
        return result;
      }
    } else {
      return result;
    }
  } else {
    return result;
  }
}
