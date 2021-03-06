<?php

class Migration_add_usage_rates extends CI_Migration{

	public function up(){

		$this->dbforge->add_field([
			'id' => [
				'type' => 'INT',
				'unsigned' => TRUE,
				'auto_increment' => TRUE
			],
			'userId'	=> [
				'type' => 'INT',
				'unsigned' => TRUE,
			],
			'date'	=> [
				'type'	=> 'DATETIME',
			],
			'usage'	=> [
				'type'		=> 'INT',
				'unsigned'	=> TRUE,
			],
			'requests'	=> [
				'type'		=> 'INT',
				'unsigned'	=> TRUE,
			],
		]);

		$this->dbforge->add_key('id', TRUE);
		$this->dbforge->create_table('usage_rates', true);

	}

	public function down(){

		$this->dbforge->drop_table('usage_rates');

	}

}