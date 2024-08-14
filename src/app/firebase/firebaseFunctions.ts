import { userRoleEditFunction } from './functions/userRoleEditFunction';
import { fineAddFunction } from './functions/fineAddFunction';
import { fineDeleteFunction } from './functions/fineDeleteFunction';
import { fineTemplateAddFunction } from './functions/fineTemplateAddFunction';
import { fineTemplateDeleteFunction } from './functions/fineTemplateDeleteFunction';
import { fineTemplateUpdateFunction } from './functions/fineTemplateUpdateFunction';
import { fineUpdateFunction } from './functions/fineUpdateFunction';
import { invitationInviteFunction } from './functions/invitationInviteFunction';
import { invitationRegisterFunction } from './functions/invitationRegisterFunction';
import { invitationWithdrawFunction } from './functions/invitationWithdrawFunction';
import { notificationRegisterFunction } from './functions/notificationRegisterFunction';
import { notificationSubscribeFunction } from './functions/notificationSubscribeFunction';
import { paypalMeEditFunction } from './functions/paypalMeEditFunction';
import { personAddFunction } from './functions/personAddFunction';
import { personDeleteFunction } from './functions/personDeleteFunction';
import { personUpdateFunction } from './functions/personUpdateFunction';
import { teamNewFunction } from './functions/teamNewFunction';
import { userLoginFunction } from './functions/userLoginFunction';

export const firebaseFunctions = {
    team: {
        new: teamNewFunction
    },
    user: {
        login: userLoginFunction,
        roleEdit: userRoleEditFunction
    },
    paypalMe: {
        edit: paypalMeEditFunction
    },
    notification: {
        register: notificationRegisterFunction,
        subscribe: notificationSubscribeFunction
    },
    invitation: {
        invite: invitationInviteFunction,
        withdraw: invitationWithdrawFunction,
        register: invitationRegisterFunction
    },
    person: {
        add: personAddFunction,
        update: personUpdateFunction,
        delete: personDeleteFunction
    },
    fineTemplate: {
        add: fineTemplateAddFunction,
        update: fineTemplateUpdateFunction,
        delete: fineTemplateDeleteFunction
    },
    fine: {
        add: fineAddFunction,
        update: fineUpdateFunction,
        delete: fineDeleteFunction
    }
};
