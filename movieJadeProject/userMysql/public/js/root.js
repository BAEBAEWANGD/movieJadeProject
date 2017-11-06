// add hidden input alive
$(function() {
	$('.comment').click(function(e) {
		//const id = this.id;
		const target = $(this);
		const toname = target.data('toname');
		const tid = target.data('tid');
		const who = target.data('who');
		$("input[name='comment[toname]']").attr('value',toname);

		$("input[name='comment[tid]']").attr('value',tid);
		$("input[name='comment[who]']").attr('value',who);

	})
})