import { TestBed } from '@angular/core/testing';
import { FirebaseFunctionsService } from '../firebase-functions/firebase-functions.service';
import { ConfigurationService } from '../configuration/configuration.service';
import { UserManagerService } from '../user-manager/user-manager.service';
import { RandomDataGeneratorService } from './random-data-generator.service';

describe('RandomDataGeneratorService', () => {
  let service: RandomDataGeneratorService;
  let mockFirebaseFunctionsService: {
    functions: {
      team: { new: { execute: jasmine.Spy } };
      person: { add: { execute: jasmine.Spy }, roleEdit: { execute: jasmine.Spy } };
      fineTemplate: { add: { execute: jasmine.Spy } };
      fine: { add: { execute: jasmine.Spy } };
    };
  };

  beforeEach(() => {
    mockFirebaseFunctionsService = {
      functions: {
        team: { new: { execute: jasmine.createSpy('team.new.execute').and.returnValue(Promise.resolve()) } },
        person: {
          add: { execute: jasmine.createSpy('person.add.execute').and.returnValue(Promise.resolve()) },
          roleEdit: { execute: jasmine.createSpy('person.roleEdit.execute').and.returnValue(Promise.resolve()) }
        },
        fineTemplate: { add: { execute: jasmine.createSpy('fineTemplate.add.execute').and.returnValue(Promise.resolve()) } },
        fine: { add: { execute: jasmine.createSpy('fine.add.execute').and.returnValue(Promise.resolve()) } }
      }
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: FirebaseFunctionsService, useValue: mockFirebaseFunctionsService },
        { provide: ConfigurationService, useValue: { currency: 'EUR', locale: 'en' } },
        { provide: UserManagerService, useValue: jasmine.createSpyObj('UserManagerService', ['setUser', 'setTeamId']) }
      ]
    });

    service = TestBed.inject(RandomDataGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create development teams with persons, fine templates and fines', async () => {
    await service.createDevelopmentTeamsForNewUser();

    expect(mockFirebaseFunctionsService.functions.team.new.execute).toHaveBeenCalledTimes(4);
    expect(mockFirebaseFunctionsService.functions.person.roleEdit.execute).toHaveBeenCalledTimes(4);
    expect(mockFirebaseFunctionsService.functions.person.add.execute).toHaveBeenCalledTimes(24);
    expect(mockFirebaseFunctionsService.functions.fineTemplate.add.execute).toHaveBeenCalledTimes(24);
    expect(mockFirebaseFunctionsService.functions.fine.add.execute).toHaveBeenCalledTimes(32);
  });
});
