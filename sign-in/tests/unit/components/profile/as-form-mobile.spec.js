import { shallowMount, flushPromises } from '@vue/test-utils'
import as_form from '@/components/profile/as-form-mobile'

describe('@/compontent/profile/as-form-mobile.vue', () => {
  const person = {
    id: '/+14151234356',
    first_name: 'Scott',
    last_name: 'Fryxell',
    mobile: '4151234356'
  }
  let wrapper
  beforeEach(async () => {
    wrapper = await shallowMount(as_form, { props: { person } })
    await flushPromises()
  })
  describe('Renders', () => {
    it('Profile form', () => {
      expect(wrapper.element).toMatchSnapshot()
    })
  })
  describe('Elements', () => {
    describe('input#mobile', () => {
      describe('keypress', () => {
        let input, stub
        beforeEach(async () => {
          input = wrapper.find('#mobile')
          stub = jest.fn()
        })
        it('Accept numbers', () => {
          input.trigger('keypress', {
            key: '2',
            preventDefault: stub
          })
          expect(stub).not.toBeCalled()
        })
        it('Only accept numbers', () => {
          input.trigger('keypress', {
            key: 'a',
            preventDefault: stub
          })
          expect(stub).toBeCalled()
        })
      })
      describe('paste', () => {
        let input
        beforeEach(async () => {
          input = wrapper.find('#mobile')
        })
        it('Reject invalid mobile number', () => {
          input.trigger('paste', {
            clipboardData: {
              getData: () => {
                return 'abc-123-1234'
              }
            }
          })
          expect(wrapper.emitted('update:person')).toBeTruthy()
          expect(wrapper.emitted('update:person').length).toBe(1)
        })
        it('Accept 6282281824', () => {
          input.trigger('paste', {
            clipboardData: {
              getData() {
                return '4151234567'
              }
            }
          })
          expect(wrapper.emitted('update:person')).toBeTruthy()
          expect(wrapper.emitted('update:person').length).toBe(2)
          const second_event = wrapper.emitted('update:person')[1]
          expect(second_event[0].mobile).toBe('4151234567')
        })
        it('Accept (628) 228-1824', () => {
          input.trigger('paste', {
            clipboardData: {
              getData() {
                return '(628) 228-1824‬'
              }
            }
          })
          expect(wrapper.emitted('update:person')).toBeTruthy()
          expect(wrapper.emitted('update:person').length).toBe(2)
          const second_event = wrapper.emitted('update:person')[1]
          expect(second_event[0].mobile).toBe('6282281824')
        })
        it('Accept 628.228.1824', () => {
          input.trigger('paste', {
            clipboardData: {
              getData() {
                return '628.228.1824'
              }
            }
          })
          expect(wrapper.emitted('update:person')).toBeTruthy()
          expect(wrapper.emitted('update:person').length).toBe(2)
          const second_event = wrapper.emitted('update:person')[1]
          expect(second_event[0].mobile).toBe('6282281824')
        })
        it('Accept 628-228-1824', () => {
          input.trigger('paste', {
            clipboardData: {
              getData() {
                return '628-228-1824'
              }
            }
          })
          expect(wrapper.emitted('update:person')).toBeTruthy()
          expect(wrapper.emitted('update:person').length).toBe(2)
          const second_event = wrapper.emitted('update:person')[1]
          expect(second_event[0].mobile).toBe('6282281824')
        })
      })
    })
    describe('button#authorize', () => {
      let button
      beforeEach(async () => {
        button = wrapper.find('#authorize')
      })
      it('Enabled with valid mobile number', () => {
        expect(button.exists()).toBe(true)
      })
      it('Disabled with invalid mobile number', async () => {
        const invalid_person = { mobile: '415123456a' }
        wrapper = await shallowMount(as_form, {
          props: { person: invalid_person }
        })
        await flushPromises()
        button = wrapper.find('#authorize')
        expect(wrapper.vm.disabled_sign_in).toBe(true)
        expect(button.attributes('disabled')).toBe('')
      })
      it('Starts captcha verification when clicked', async () => {
        await button.trigger('click')
        expect(wrapper.vm.show_captcha).toBe(true)
        const captcha = wrapper.find('#captcha')
        expect(captcha.exists()).toBe(true)
      })
      it('Is removed after click', async () => {
        expect(button.exists()).toBe(true)
        await button.trigger('click')
        expect(wrapper.vm.show_authorize).toBe(false)
        button = wrapper.find('#authorize')
        expect(button.exists()).toBe(false)
      })
    })
    describe('input#verification-code', () => {
      let input, stub
      beforeEach(async () => {
        wrapper.vm.show_code = true
        wrapper.vm.code = '12345'
        await wrapper.vm.$forceUpdate()
        input = wrapper.find('#verification-code')
        stub = jest.fn()
      })
      it('Allow valid digits', () => {
        input.trigger('keypress', {
          key: '2',
          preventDefault: stub
        })
        expect(stub).not.toBeCalled()
      })
      it('Only accept numbers length equal to 5', () => {
        const button = wrapper.find('#submit-verification')
        input.trigger('keypress', {
          key: 'a',
          preventDefault: stub
        })
        expect(stub).toBeCalled()
        expect(button.attributes().disabled).toBe(undefined)
      })
      it('Only accept numbers length less than 5', async () => {
        wrapper.vm.code = '123'
        await wrapper.vm.$forceUpdate()
        input.trigger('keypress', {
          key: 'a',
          preventDefault: stub
        })
        expect(stub).toBeCalled()
      })
      it('Renders sign on button with valid input', () => {
        input.trigger('keypress', {
          key: '6',
          preventDefault: stub
        })
        expect(stub).not.toBeCalled()
      })
    })
    describe('button#submit-verification', () => {
      let wrapper, button, confirm_spy
      beforeEach(async () => {
        confirm_spy = jest.fn(() => Promise.resolve('result of confirm_spy'))
        wrapper = await shallowMount(as_form, {
          props: { person }
        })
        wrapper.vm.authorizer = { confirm: confirm_spy }
        wrapper.vm.show_code = true
        await flushPromises()
        button = wrapper.find('#submit-verification')
      })
      it('Signs the user in', async () => {
        await button.trigger('click')
        expect(confirm_spy).toBeCalled()
      })
      it('Hides input#verification-code when clicked', async () => {
        expect(wrapper.find('#verification-code').exists()).toBe(true)
        await button.trigger('click')
        expect(wrapper.find('#verification-code').exists()).toBe(false)
        expect(wrapper.vm.show_code).toBe(false)
      })
      it('Emits an event when the user is signed on', async () => {
        await wrapper.vm.sign_in_with_code()
        expect(wrapper.emitted('signed-on')).toBeTruthy()
      })
      it('Invalid verification code when the user is signed on', async () => {
        confirm_spy = jest.fn(() =>
          Promise.reject({ code: 'auth/invalid-verification-code' })
        )
        wrapper.vm.authorizer = { confirm: confirm_spy }
        await wrapper.vm.$forceUpdate()
        await wrapper.vm.sign_in_with_code()
        expect(wrapper.emitted('signed-on')).toBeFalsy()
      })
      it('Other than Invalid verification when the user is signed on', async () => {
        confirm_spy = jest.fn(() =>
          Promise.reject({ code: 'other error than invalid verification code' })
        )
        wrapper.vm.authorizer = { confirm: confirm_spy }
        await wrapper.vm.$forceUpdate()
        await wrapper.vm.sign_in_with_code()
        expect(wrapper.emitted('signed-on')).toBeFalsy()
      })
    })
  })
  describe('Methods', () => {
    describe('#text_human_verify_code', () => {
      let wrapper
      beforeEach(async () => {
        wrapper = await shallowMount(as_form, {
          props: { person }
        })
        wrapper.vm.show_code = true
      })
      it('Hides captcha div', () => {
        wrapper.vm.text_human_verify_code()
        expect(wrapper.vm.hide_captcha).toBe(true)
      })
      it('Renders verification-code input', () => {
        wrapper.vm.text_human_verify_code()
        expect(wrapper.vm.show_code).toBe(true)
      })
    })
  })
  describe('Watchers', () => {
    describe('mobile', () => {
      it('Emites updates when mobile number is changed', async () => {
        const wrapper = await shallowMount(as_form, { props: { person } })
        await flushPromises()
        wrapper.vm.cell = '415'
        expect(wrapper.emitted('update:person')).toBeTruthy()
      })
    })
  })
  describe('Computed', () => {
    describe('mobile', () => {
      it('Return Mobile when props mobile is empty', async () => {
        const person = {
          id: '/+14151234356',
          first_name: 'Scott',
          last_name: 'Fryxell',
          mobile: ''
        }
        const wrapper = await shallowMount(as_form, { props: { person } })
        expect(wrapper.find('legend').text()).toBe('Mobile')
      })
    })
  })
})
